import type { Query, QueryStatus, QueryObserverOptions } from '@tanstack/query-core'

import type { Endpoint, Failed, LocalOptions, Outcome, Success } from '@outcomify/requestify'

export type HttpRestTanstackQuery<Base extends string> = {
  <Data>(
    action: () => Promise<Outcome<Data>>,
    parameters: HttpRestTanstackQueryParameters<Data>,
  ): HttpRestTanstackQueryOutcome<Data>
  <Data>(
    endpoint: Endpoint<Base>,
    parameters: HttpRestTanstackQueryParameters<Data>,
  ): HttpRestTanstackQueryOutcome<Data>
  <Data>(
    source: HttpRestTanstackQuerySource<Base, Data>,
    parameters: HttpRestTanstackQueryParameters<Data>,
  ): HttpRestTanstackQueryOutcome<Data>
}

export type HttpRestTanstackQuerySource<Base extends string, Data = unknown> =
  | Endpoint<Base>
  | (() => Promise<Outcome<Data>>)

export type HttpRestTanstackQueryStale<Data> =
  | number
  | ((query: Query<Success<Data>, Failed, Success<Data>, readonly unknown[]>) => number)

export type HttpRestTanstackQueryParameters<Data = unknown> = {
  key: unknown[]
  stale?: HttpRestTanstackQueryStale<Data>
  enabled?: boolean
  defaults?: Data
  options?: LocalOptions<Data>
  extras?: Omit<
    QueryObserverOptions<Success<Data>, Failed>,
    'queryKey' | 'queryFn' | 'enabled' | 'initialData' | 'staleTime'
  >
}

export type HttpRestTanstackQueryOutcome<Data> = {
  states: {
    status: QueryStatus
    success: boolean
    failed: boolean
    pending: boolean
    loading: boolean
    fetching: boolean
    refetching: boolean
    stale: boolean
  }
  responses: {
    success: Success<Data> | undefined
    failed: Failed | null
  }
  handlers: {
    refetch: () => void
  }
}
