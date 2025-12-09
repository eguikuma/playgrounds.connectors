import type { RequestInterceptor } from './request'
import type { Failed, ResponseInterceptor, Success } from './response'

export type GlobalOptions = {
  base?: string
  timeout?: number
  headers?: HeadersInit
  credentials?: RequestCredentials
  redirect?: RequestRedirect
  unsafe?: boolean
  localhost?: boolean
  interceptors?: Interceptors
  on?: OnRule
  status?: StatusRule
}

export type LocalOptions<Data = unknown> = Omit<GlobalOptions, 'interceptors'> &
  Omit<RequestInit, 'method' | 'body'> & {
    queries?: Record<string, string | number | boolean>
    verify?: VerifyRule<Data>
    interceptors?: Interceptors<Data>
  }

export type Interceptors<Data = unknown> = {
  request?: RequestInterceptor[]
  response?: ResponseInterceptor<Data>[]
}

export type VerifyRule<Data> = (data: Data) => boolean

export type OnRule<Data = unknown> = {
  success?: (data: Success<Data>) => void
  unauthorized?: (data: Failed) => void
  failed?: (data: Failed) => void
}

export type StatusRuleSet = {
  success?: number[]
  failed?: number[]
}

export type StatusRuleFunction = (code: number) => boolean

export type StatusRule = StatusRuleSet | StatusRuleFunction
