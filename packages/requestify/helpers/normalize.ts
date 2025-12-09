import { getReasonPhrase, StatusCodes } from 'http-status-codes'

import { UnresolvedSourceError, VerifyError } from './exception'
import { asThis, has, isCancelled, isFunction, isNumber, isString } from './guard'
import type { GlobalOptions, StatusRule } from '../models/options'
import type { Endpoint } from '../models/request'
import type { Failed, Outcome, Success } from '../models/response'

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
    message:
      has<Failed>('success')(thrown) &&
      thrown.success === false &&
      has<Failed>('message')(thrown) &&
      isString(thrown.message) &&
      has<Failed>('status')(thrown) &&
      isNumber(thrown.status)
        ? thrown.message
        : getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
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
