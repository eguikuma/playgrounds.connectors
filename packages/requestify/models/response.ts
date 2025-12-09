import type { Method } from './request'

export type Success<Data> = {
  success: true
  status: number
  data: Data
}

export type Failed = {
  success: false
  status: number
  message: string
  body?: unknown
}

export type Outcome<Data> = Success<Data> | Failed

export type ResponseContext<Data = unknown> = {
  method: Method
  endpoint: string
  outcome: Outcome<Data>
  raw: Response | null
}

export type ResponseInterceptor<Data = unknown> = (
  context: ResponseContext<Data>,
) => ResponseContext<Data> | Promise<ResponseContext<Data>>
