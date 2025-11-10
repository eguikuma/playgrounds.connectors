import { StatusCodes } from 'http-status-codes'

import { InvalidUrlError, UrlTooLongError, VerifyError } from './errors'
import { assertHeaders, assertUrl, chain, failify, headerify, outcomify } from './helpers'
import type {
  DefaultBase,
  Endpoint,
  ExtendedBase,
  GlobalOptions,
  Interceptors,
  Join,
  LocalOptions,
  Method,
  OnRule,
  Outcome,
  RequestBody,
  RequestContext,
  ResponseContext,
  StatusRule,
} from './models'

export const factory = <const Options extends Partial<GlobalOptions>>(
  options?: Options,
): Request<ExtendedBase<DefaultBase, Options>> => new Request(options)

export class Request<Base extends string = string> {
  private readonly _defaults: GlobalOptions = {
    base: '',
    timeout: 10000,
    credentials: 'same-origin',
    redirect: 'follow',
  }
  private readonly _options: GlobalOptions

  constructor(options: GlobalOptions = {}) {
    this._options = {
      ...this._defaults,
      ...options,
    }
  }

  async send<Data>(
    method: Method,
    endpoint: Endpoint<Base>,
    body?: RequestBody,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>> {
    const interceptors = {
      request: [
        ...(this._options.interceptors?.request ?? []),
        ...(options?.interceptors?.request ?? []),
      ],
      response: [
        ...(options?.interceptors?.response ?? []),
        ...(this._options.interceptors?.response ?? []),
      ],
    }

    const rules = {
      on: {
        success: options?.on?.success ?? this._options.on?.success,
        failed: options?.on?.failed ?? this._options.on?.failed,
        unauthorized: options?.on?.unauthorized ?? this._options.on?.unauthorized,
      },
      status: options?.status ?? this._options.status,
    }

    let before: RequestContext<Data>
    try {
      before = {
        method,
        endpoint: this.endpoint(endpoint, options),
        options: {
          ...options,
          headers: {
            ...headerify(this._options.headers),
            ...headerify(options?.headers),
          },
          credentials: options?.credentials ?? this._options.credentials,
          timeout: options?.timeout ?? this._options.timeout,
          localhost: options?.localhost !== undefined ? options.localhost : this._options.localhost,
          redirect: options?.redirect ?? this._options.redirect,
        },
        body,
      }
    } catch (thrown) {
      return failify(thrown)
    }

    let response: Response | null = null
    try {
      for (const interceptor of interceptors.request) {
        before = await interceptor(before)
      }

      response = await this.call(before)

      const outcome = await outcomify<Data>(response, rules.status)

      let after: ResponseContext<Data> = {
        method: before.method,
        endpoint: before.endpoint,
        outcome,
        raw: response,
      }

      for (const interceptor of interceptors.response) {
        after = await interceptor(after)
      }

      if (!after.outcome.success) {
        throw response
      }

      if (options?.verify && !options.verify(after.outcome.data)) {
        throw new VerifyError()
      }

      rules.on.success?.(after.outcome)

      return after.outcome
    } catch (thrown) {
      const failed = await failify(thrown, before.options)

      let after: ResponseContext<Data> = {
        method: before.method,
        endpoint: before.endpoint,
        outcome: failed,
        raw: response,
      }

      if (!response) {
        for (const interceptor of interceptors.response) {
          after = await interceptor(after)
        }
      }

      if (failed.status === StatusCodes.UNAUTHORIZED) {
        rules.on.unauthorized?.(failed)
      } else {
        rules.on.failed?.(failed)
      }

      return failed
    }
  }

  async get<Data>(endpoint: Endpoint<Base>, options?: LocalOptions<Data>): Promise<Outcome<Data>> {
    return this.send<Data>('GET', endpoint, undefined, options)
  }

  async post<Data, Body extends RequestBody = RequestBody>(
    endpoint: Endpoint<Base>,
    body?: Body,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>> {
    return this.send<Data>('POST', endpoint, body, options)
  }

  async put<Data, Body extends RequestBody = RequestBody>(
    endpoint: Endpoint<Base>,
    body?: Body,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>> {
    return this.send<Data>('PUT', endpoint, body, options)
  }

  async delete<Data>(
    endpoint: Endpoint<Base>,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>> {
    return this.send<Data>('DELETE', endpoint, undefined, options)
  }

  async patch<Data, Body extends RequestBody = RequestBody>(
    endpoint: Endpoint<Base>,
    body?: Body,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>> {
    return this.send<Data>('PATCH', endpoint, body, options)
  }

  extend<const Options extends Partial<GlobalOptions> = Partial<GlobalOptions>>(
    options: Options,
  ): Request<
    Options extends { base: infer ChildBase extends string }
      ? ChildBase extends ''
        ? Base
        : Join<Base, ChildBase>
      : Base
  > {
    const merged = this.options(this._options, options)

    if (options.base && merged.base) {
      assertUrl(merged.base, merged.unsafe, merged.localhost)
    }

    return new Request(merged)
  }

  private endpoint<Data>(route: string, options?: LocalOptions<Data>): Endpoint<Base> {
    const base = options?.base || this._options.base || this._defaults.base || ''
    let endpoint = (() => {
      if (route.includes('://')) {
        return route
      }

      if (!route) {
        return base
      }

      const normalized = {
        base: base.replace(/\/+$/, ''),
        route: route.startsWith('/') ? route : `/${route}`,
      }

      return `${normalized.base}${normalized.route}`
    })()

    if (options?.queries) {
      const query = new URLSearchParams()
      for (const [key, value] of Object.entries(options.queries)) {
        query.append(key, String(value))
      }

      const search = query.toString()
      if (search) {
        const separator = (() => {
          if (endpoint.endsWith('?') || endpoint.endsWith('&')) {
            return ''
          }

          return endpoint.includes('?') ? '&' : '?'
        })()

        endpoint = `${endpoint}${separator}${search}`
      }
    }

    if (endpoint.length > UrlTooLongError.MaxLength) {
      throw new UrlTooLongError()
    }

    if (endpoint.includes('://')) {
      try {
        new URL(endpoint)
      } catch (_thrown) {
        throw new InvalidUrlError()
      }

      assertUrl(
        endpoint,
        options?.unsafe ?? this._options.unsafe,
        options?.localhost ?? this._options.localhost,
      )
    }

    return endpoint
  }

  private options(parent: GlobalOptions, child: Partial<GlobalOptions>): GlobalOptions {
    const base = (() => {
      if (!child.base) {
        return parent.base
      }

      if (!parent.base) {
        return child.base
      }

      if (child.base.startsWith('http://') || child.base.startsWith('https://')) {
        return child.base
      }

      if (child.base.startsWith('/')) {
        const parsed = new URL(parent.base)

        return `${parsed.origin}${child.base}`
      }

      return new URL(
        child.base,
        parent.base.endsWith('/') ? parent.base : `${parent.base}/`,
      ).toString()
    })()

    const timeout = child.timeout !== undefined ? child.timeout : parent.timeout

    const headers = {
      ...headerify(parent.headers),
      ...headerify(child.headers),
    }

    const credentials = child.credentials !== undefined ? child.credentials : parent.credentials

    const unsafe = child.unsafe !== undefined ? child.unsafe : parent.unsafe

    const localhost = child.localhost !== undefined ? child.localhost : parent.localhost

    const interceptors: Interceptors = {
      request: [...(parent.interceptors?.request ?? []), ...(child.interceptors?.request ?? [])],
      response: [...(child.interceptors?.response ?? []), ...(parent.interceptors?.response ?? [])],
    }

    const on: OnRule = (() => {
      const merged: OnRule = {}

      merged.success = chain(parent.on?.success, child.on?.success)
      merged.unauthorized = chain(parent.on?.unauthorized, child.on?.unauthorized)
      merged.failed = chain(parent.on?.failed, child.on?.failed)

      return Object.keys(merged).length > 0 ? merged : {}
    })()

    const status: StatusRule | undefined = child.status !== undefined ? child.status : parent.status

    return {
      base,
      timeout,
      headers,
      credentials,
      unsafe,
      localhost,
      interceptors,
      on,
      status,
    }
  }

  private async call<Data>(context: RequestContext<Data>): Promise<Response> {
    const {
      method,
      endpoint,
      options: { headers: _headers, ...options },
      body,
    } = context
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), options.timeout)

    try {
      const headers = new Headers(_headers)
      if (body && !headers.has('content-type') && !(body instanceof FormData)) {
        headers.set('Content-Type', 'application/json')
      }

      assertHeaders(headers)

      const response = await fetch(endpoint, {
        ...options,
        method,
        headers,
        body:
          body && typeof body === 'object' && !(body instanceof FormData)
            ? JSON.stringify(body)
            : body,
        signal: controller.signal,
        redirect: options.redirect,
      })

      return response
    } finally {
      clearTimeout(timer)
    }
  }
}
