import type { RequestInterceptor, ResponseInterceptor, Method, LocalOptions } from '../models'

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

export type MonitorResponded = {
  kind: typeof MonitorKind.Response
  method: Method
  endpoint: string
  status: number
  outcome: unknown
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
  (options: MonitorOptions<MonitorResponded>): ResponseInterceptor =>
  (context) => {
    options.observer({
      kind: MonitorKind.Response,
      method: context.method,
      endpoint: context.endpoint,
      status: context.outcome.status,
      outcome: context.outcome,
    })

    return context
  }

export const monitor = {
  requested,
  responded,
}
