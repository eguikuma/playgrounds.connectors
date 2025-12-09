import type {
  InfiniteData,
  InfiniteQueryObserverOptions,
  Query,
  QueryStatus,
} from '@tanstack/query-core'

import type { Endpoint, Failed, LocalOptions, Outcome, Success } from '@outcomify/requestify'

export type HttpRestTanstackInfiniteQuery<Base extends string> = {
  <Data, Variables = HttpRestTanstackInfiniteQueryVariables>(
    action: (variables: Variables) => Promise<Outcome<Data>>,
    parameters: HttpRestTanstackInfiniteQueryParameters<Data, Data, Variables> & {
      next: (parameters: {
        last: Success<Data>
        pages: Success<Data>[]
        variables: Variables
      }) => Variables | undefined
    },
  ): HttpRestTanstackInfiniteQueryOutcome<Data>
  <Data, Original = Data, Variables = HttpRestTanstackInfiniteQueryVariables>(
    action: (variables: Variables) => Promise<Outcome<Original>>,
    parameters: HttpRestTanstackInfiniteQueryParameters<Data, Original, Variables> & {
      next: (parameters: {
        last: Success<Data>
        pages: Success<Data>[]
        variables: Variables
      }) => Variables | undefined
      transform: (original: Original, variables: Variables) => Data
    },
  ): HttpRestTanstackInfiniteQueryOutcome<Data>
  <Data, Variables = HttpRestTanstackInfiniteQueryVariables>(
    endpoint: Endpoint<Base>,
    parameters: HttpRestTanstackInfiniteQueryParameters<Data, Data, Variables> & {
      next: (parameters: {
        last: Success<Data>
        pages: Success<Data>[]
        variables: Variables
      }) => Variables | undefined
    },
  ): HttpRestTanstackInfiniteQueryOutcome<Data>
  <Data, Original, Variables = HttpRestTanstackInfiniteQueryVariables>(
    endpoint: Endpoint<Base>,
    parameters: HttpRestTanstackInfiniteQueryParameters<Data, Original, Variables> & {
      next: (parameters: {
        last: Success<Data>
        pages: Success<Data>[]
        variables: Variables
      }) => Variables | undefined
      transform: (original: Original, variables: Variables) => Data
    },
  ): HttpRestTanstackInfiniteQueryOutcome<Data>
  <Data, Variables = HttpRestTanstackInfiniteQueryVariables>(
    template: (variables: Variables) => Endpoint<Base>,
    parameters: HttpRestTanstackInfiniteQueryParameters<Data, Data, Variables> & {
      next: (parameters: {
        last: Success<Data>
        pages: Success<Data>[]
        variables: Variables
      }) => Variables | undefined
    },
  ): HttpRestTanstackInfiniteQueryOutcome<Data>
  <Data, Original = Data, Variables = HttpRestTanstackInfiniteQueryVariables>(
    template: (variables: Variables) => Endpoint<Base>,
    parameters: HttpRestTanstackInfiniteQueryParameters<Data, Original, Variables> & {
      next: (parameters: {
        last: Success<Data>
        pages: Success<Data>[]
        variables: Variables
      }) => Variables | undefined
      transform: (original: Original, variables: Variables) => Data
    },
  ): HttpRestTanstackInfiniteQueryOutcome<Data>
  <Data, Variables = HttpRestTanstackInfiniteQueryVariables>(
    source: HttpRestTanstackInfiniteQuerySource<Base, Data, Variables>,
    parameters: HttpRestTanstackInfiniteQueryParameters<Data, Data, Variables> & {
      next: (parameters: {
        last: Success<Data>
        pages: Success<Data>[]
        variables: Variables
      }) => Variables | undefined
    },
  ): HttpRestTanstackInfiniteQueryOutcome<Data>
  <Data, Original, Variables = HttpRestTanstackInfiniteQueryVariables>(
    source: HttpRestTanstackInfiniteQuerySource<Base, Original, Variables>,
    parameters: HttpRestTanstackInfiniteQueryParameters<Data, Original, Variables> & {
      next: (parameters: {
        last: Success<Data>
        pages: Success<Data>[]
        variables: Variables
      }) => Variables | undefined
      transform: (original: Original, variables: Variables) => Data
    },
  ): HttpRestTanstackInfiniteQueryOutcome<Data>
}

export type HttpRestTanstackInfiniteQueryVariables = {
  page: number
}

export type HttpRestTanstackInfiniteQuerySource<
  Base extends string,
  Data = unknown,
  Variables = HttpRestTanstackInfiniteQueryVariables,
> = Endpoint<Base> | ((variables: Variables) => Endpoint<Base> | Promise<Outcome<Data>>)

export type HttpRestTanstackInfiniteQueryStale<Data, Variables> =
  | number
  | ((
      query: Query<
        Success<Data>,
        Failed,
        InfiniteData<Success<Data>, Variables | HttpRestTanstackInfiniteQueryVariables>,
        readonly unknown[]
      >,
    ) => number)

export type HttpRestTanstackInfiniteQueryParameters<
  Data = unknown,
  Original = Data,
  Variables = HttpRestTanstackInfiniteQueryVariables,
> = {
  key: unknown[]
  stale?: HttpRestTanstackInfiniteQueryStale<Data, Variables>
  enabled?: boolean
  defaults?: Original
  options?: LocalOptions<Original>
  extras?: Omit<
    InfiniteQueryObserverOptions<
      Success<Data>,
      Failed,
      InfiniteData<Success<Data>, Variables | HttpRestTanstackInfiniteQueryVariables>,
      unknown[],
      Variables | HttpRestTanstackInfiniteQueryVariables
    >,
    | 'queryKey'
    | 'queryFn'
    | 'enabled'
    | 'initialData'
    | 'initialPageParam'
    | 'getNextPageParam'
    | 'staleTime'
  >
} & (Variables extends HttpRestTanstackInfiniteQueryVariables
  ? { variables?: Variables }
  : { variables: Variables })

export type HttpRestTanstackInfiniteQueryOutcome<Data> = {
  states: {
    status: QueryStatus
    success: boolean
    failed: boolean
    pending: boolean
    loading: boolean
    fetching: boolean
    paging: boolean
    more: boolean
    refetching: boolean
    stale: boolean
  }
  responses: {
    success: Success<Data>[]
    failed: Failed | null
  }
  handlers: {
    next: () => void
    refetch: () => void
  }
}
