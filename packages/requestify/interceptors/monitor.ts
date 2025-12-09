import type { LocalOptions } from '../models/options'
import type { Method, RequestInterceptor } from '../models/request'
import type { ResponseInterceptor } from '../models/response'

export const MonitorKind = {
  Request: 'request',
  Response: 'response',
} as const

export type MonitorKind = (typeof MonitorKind)[keyof typeof MonitorKind]

export type MonitorRequested = {
  kind: typeof MonitorKind.Request
  method: Method
  endpoint: string
  options: Omit<LocalOptions<unknown>, 'verify'>
  body?: unknown
}

export type MonitorResponded<Data = unknown> = {
  kind: typeof MonitorKind.Response
  method: Method
  endpoint: string
  status: number
  data: Data | null
}

type MonitorOptions<Event> = {
  observer: (event: Event) => void
}

const requested =
  (options: MonitorOptions<MonitorRequested>): RequestInterceptor =>
  (context) => {
    options.observer({
      kind: MonitorKind.Request,
      method: context.method,
      endpoint: context.endpoint,
      options: context.options,
      body: context.body,
    })

    return context
  }

const responded =
  <Data = unknown>(options: MonitorOptions<MonitorResponded<Data>>): ResponseInterceptor<Data> =>
  (context) => {
    options.observer({
      kind: MonitorKind.Response,
      method: context.method,
      endpoint: context.endpoint,
      status: context.outcome.status,
      data: context.outcome.success ? context.outcome.data : null,
    })

    return context
  }

export const monitor = {
  requested,
  responded,
}
