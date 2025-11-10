import { StatusCodes, getReasonPhrase } from 'http-status-codes'

import { UnsafeUrlError, InvalidMetadataError, VerifyError, UnresolvedSourceError } from './errors'
import type { Endpoint, Failed, GlobalOptions, Outcome, StatusRule, Success } from './models'

const PrivateIpv4Options = {
  ClassA: { First: 10 },
  ClassB: { First: 172, SecondMin: 16, SecondMax: 31 },
  ClassC: { First: 192, Second: 168 },
  Loopback: { First: 127 },
  LinkLocal: { First: 169, Second: 254 },
  ZeroAddress: { First: 0 },
} as const

const PrivateIpv6Options = {
  Loopback: { Full: '[::1]', Zero: '[::]' },
  LinkLocal: { Prefix: '[fe80:', ZeroPrefix: '[fe80::' },
  UniqueLocalFC: { Prefix: '[fc00:', ZeroPrefix: '[fc00::' },
  UniqueLocalFD: { Prefix: '[fd00:', ZeroPrefix: '[fd00::' },
} as const

export const headerify = (value?: HeadersInit): Record<string, string> => {
  if (!value) return {}

  if (value instanceof Headers) {
    return Object.fromEntries(value.entries())
  }

  if (Array.isArray(value)) {
    return Object.fromEntries(value)
  }

  return value
}

export const successify = <Data>(data: Data, status: number = StatusCodes.OK): Success<Data> => ({
  success: true,
  status,
  data,
})

export const failify = async (
  thrown: unknown,
  options?: Partial<GlobalOptions>,
): Promise<Failed> => {
  if (thrown instanceof Response) {
    const status = thrown.status

    try {
      const body = await thrown.clone().json()

      return {
        success: false,
        status,
        message: body.message || getReasonPhrase(status),
        body,
      }
    } catch {
      return {
        success: false,
        status,
        message: getReasonPhrase(status),
      }
    }
  }

  if (thrown instanceof Error) {
    if (isCancelled(thrown)) {
      return {
        success: false,
        status: StatusCodes.REQUEST_TIMEOUT,
        message: getReasonPhrase(StatusCodes.REQUEST_TIMEOUT),
      }
    }

    if (thrown instanceof TypeError && options?.redirect === 'error') {
      return {
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Redirect not allowed',
      }
    }

    return {
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: thrown.message || getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    }
  }

  return {
    success: false,
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
  }
}

export const outcomify = async <Data>(
  response: Response,
  status?: StatusRule,
): Promise<Outcome<Data>> => {
  if (
    response.type === 'opaqueredirect' &&
    typeof status === 'object' &&
    status?.success?.some(
      (status) => status >= StatusCodes.MULTIPLE_CHOICES && status < StatusCodes.BAD_REQUEST,
    )
  ) {
    return {
      success: true,
      status: 0,
      data: asThis<Data>(null),
    }
  }

  const unwrapped = await unwrap(response)

  if (!pass(response.status, status)) {
    return {
      success: false,
      status: response.status,
      message: getReasonPhrase(response.status),
      body: unwrapped,
    }
  }

  return {
    success: true,
    status: response.status,
    data: asThis<Data>(unwrapped),
  }
}

export const unify = async <Base extends string, Data, Parameters extends unknown[]>({
  source,
  parameters,
  executor,
  verify,
}: {
  source:
    | Endpoint<Base>
    | ((
        ...parameters: Parameters
      ) => Endpoint<Base> | Outcome<Data> | Promise<Endpoint<Base> | Outcome<Data>>)
    | (() => Endpoint<Base> | Outcome<Data> | Promise<Endpoint<Base> | Outcome<Data>>)
  parameters?: Parameters
  executor: (endpoint: Endpoint<Base>) => Promise<Outcome<Data>>
  verify?: (data: Data) => boolean
}): Promise<Outcome<Data>> => {
  try {
    if (isString(source)) {
      return await executor(source)
    }

    let resolved: Endpoint<Base> | Outcome<Data> | null = null
    if (!parameters && isFunction(source)) {
      resolved = await source()
    }
    if (parameters && isFunction(source)) {
      resolved = await source(...parameters)
    }

    if (!resolved) {
      throw new UnresolvedSourceError()
    }

    if (isString(resolved)) {
      return await executor(resolved)
    }

    if (resolved.success && verify && !verify(resolved.data)) {
      throw new VerifyError()
    }

    return resolved
  } catch (thrown) {
    return await failify(thrown)
  }
}

export const assertHeaders = (headers: Headers): void => {
  headers.forEach((value) => {
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i)

      if (code > 255 || code < 32 || code === 127) {
        throw new InvalidMetadataError()
      }
    }
  })
}

export const assertUrl = (value: string, unsafe?: boolean, localhost?: boolean): void => {
  const matched = value.match(/^https?:\/\/([^/:?#]+)/)
  const raw = matched ? matched[1] : null

  if (raw) {
    const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/

    if (ipv4.test(raw)) {
      const octets = raw.split('.')

      if (octets.some((octet) => octet.length > 1 && octet.startsWith('0'))) {
        throw new UnsafeUrlError()
      }

      const parts = octets.map(Number)

      if (parts.some((part) => part < 0 || part > 255)) {
        throw new UnsafeUrlError()
      }
    }
  }

  const parsed = new URL(value)

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new UnsafeUrlError()
  }

  if (unsafe) {
    return
  }

  const hostname = parsed.hostname.toLowerCase()

  if (hostname === 'localhost' && !localhost) {
    throw new UnsafeUrlError()
  }

  if (hostname.includes(':')) {
    if (
      hostname === PrivateIpv6Options.Loopback.Full ||
      hostname === PrivateIpv6Options.Loopback.Zero
    ) {
      if (!localhost) {
        throw new UnsafeUrlError()
      }

      return
    }

    if (
      hostname.startsWith(PrivateIpv6Options.LinkLocal.Prefix) ||
      hostname.startsWith(PrivateIpv6Options.LinkLocal.ZeroPrefix)
    ) {
      throw new UnsafeUrlError()
    }

    if (
      hostname.startsWith(PrivateIpv6Options.UniqueLocalFC.Prefix) ||
      hostname.startsWith(PrivateIpv6Options.UniqueLocalFC.ZeroPrefix)
    ) {
      throw new UnsafeUrlError()
    }

    if (
      hostname.startsWith(PrivateIpv6Options.UniqueLocalFD.Prefix) ||
      hostname.startsWith(PrivateIpv6Options.UniqueLocalFD.ZeroPrefix)
    ) {
      throw new UnsafeUrlError()
    }

    return
  }

  const pattern = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!pattern.test(hostname)) {
    return
  }

  const [first, second] = hostname.split('.').map(Number)

  if (first === PrivateIpv4Options.ClassA.First) {
    throw new UnsafeUrlError()
  }

  if (
    first === PrivateIpv4Options.ClassB.First &&
    second !== undefined &&
    second >= PrivateIpv4Options.ClassB.SecondMin &&
    second <= PrivateIpv4Options.ClassB.SecondMax
  ) {
    throw new UnsafeUrlError()
  }

  if (first === PrivateIpv4Options.ClassC.First && second === PrivateIpv4Options.ClassC.Second) {
    throw new UnsafeUrlError()
  }

  if (first === PrivateIpv4Options.Loopback.First && !localhost) {
    throw new UnsafeUrlError()
  }

  if (
    first === PrivateIpv4Options.LinkLocal.First &&
    second === PrivateIpv4Options.LinkLocal.Second
  ) {
    throw new UnsafeUrlError()
  }

  if (first === PrivateIpv4Options.ZeroAddress.First) {
    throw new UnsafeUrlError()
  }
}

export const asThis = <Expected>(value: unknown): Expected => value as Expected

export const isThis = <Expected>(value: unknown): value is Expected => !!value

/* biome-ignore lint/suspicious/noExplicitAny: 汎用的な関数型判定のため */
export const isFunction = (source: unknown): source is (...parameters: any[]) => any =>
  typeof source === 'function'

export const isResponse = (source: unknown): source is Response => source instanceof Response

export const isString = (source: unknown): source is string => typeof source === 'string'

export const isCancelled = (thrown: unknown): boolean =>
  thrown instanceof Error && (thrown.name === 'AbortError' || thrown.name === 'TimeoutError')

export const isFailed = (value: unknown): value is Failed =>
  typeof value === 'object' && value !== null && 'success' in value && value.success === false

export const unwrap = async (response: Response): Promise<unknown> => {
  const type = response.headers.get('Content-Type')

  if (type?.includes('application/json')) {
    return response.json()
  }

  if (type?.includes('xml')) {
    return response.text()
  }

  if (type?.includes('text/')) {
    return response.text()
  }

  if (response.status === StatusCodes.NO_CONTENT) {
    return undefined
  }

  return response.text()
}

export const pass = (code: number, status?: StatusRule): boolean => {
  const base = code >= StatusCodes.OK && code < StatusCodes.MULTIPLE_CHOICES

  if (!status) {
    return base
  }

  if (typeof status === 'object') {
    if (status.failed?.includes(code)) {
      return false
    }

    if (status.success?.includes(code)) {
      return true
    }

    return base
  }

  return status(code)
}

/* biome-ignore lint/suspicious/noExplicitAny: 汎用的な関数型のため */
export const chain = <Handler extends (...parameters: any[]) => void>(
  parent?: Handler,
  child?: Handler,
): Handler | undefined => {
  if (parent && child) {
    return asThis<Handler>((...parameters: Parameters<Handler>) => {
      parent(...parameters)
      child(...parameters)
    })
  }

  return parent || child
}

export const mixin = <Options extends Partial<GlobalOptions>>(
  options: Options | undefined,
  defaults: Partial<GlobalOptions>,
): Options =>
  asThis<Options>({
    ...defaults,
    ...options,
    headers: {
      ...headerify(defaults.headers),
      ...headerify(options?.headers),
    },
  })
