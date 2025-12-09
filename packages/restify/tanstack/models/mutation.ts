import type {
  InvalidateQueryFilters,
  MutationObserverOptions,
  MutationStatus,
} from '@tanstack/query-core'

import type { Endpoint, Failed, LocalOptions, Outcome, Success } from '@outcomify/requestify'

export type HttpRestTanstackMutation<Base extends string> = {
  <Data, Variables = unknown>(
    action: (variables: Variables) => Promise<Outcome<Data>>,
    parameters: HttpRestTanstackMutationParameters<Data, Variables>,
  ): HttpRestTanstackMutationOutcome<Data, Variables>
  <Data, Variables = unknown>(
    endpoint: Endpoint<Base>,
    parameters: HttpRestTanstackMutationParameters<Data, Variables>,
  ): HttpRestTanstackMutationOutcome<Data, Variables>
  <Data, Variables = unknown>(
    template: (variables: Variables) => Endpoint<Base>,
    parameters: HttpRestTanstackMutationParameters<Data, Variables>,
  ): HttpRestTanstackMutationOutcome<Data, Variables>
  <Data, Variables = unknown>(
    source: HttpRestTanstackMutationSource<Base, Data, Variables>,
    parameters: HttpRestTanstackMutationParameters<Data, Variables>,
  ): HttpRestTanstackMutationOutcome<Data, Variables>
}

export type HttpRestTanstackMutationSource<
  Base extends string,
  Data = unknown,
  Variables = unknown,
> = Endpoint<Base> | ((variables: Variables) => Endpoint<Base> | Promise<Outcome<Data>>)

export type HttpRestTanstackMutationInvalidate = {
  key: unknown[]
  mode?: InvalidateQueryFilters['type']
  exact?: InvalidateQueryFilters['exact']
  refetch?: InvalidateQueryFilters['refetchType']
  stale?: InvalidateQueryFilters['stale']
  status?: InvalidateQueryFilters['fetchStatus']
  predicate?: InvalidateQueryFilters['predicate']
}

export type HttpRestTanstackMutationParameters<Data, Variables> = {
  key?: unknown[]
  success?: (success: Success<Data>, variables: Variables) => void
  failed?: (data: Failed, variables: Variables) => void
  invalidates?: (
    | string
    | (string | number | boolean | null | undefined)[]
    | HttpRestTanstackMutationInvalidate
  )[]
  options?: LocalOptions<Data>
  extras?: Omit<
    MutationObserverOptions<Success<Data>, Failed, Variables>,
    'mutationKey' | 'mutationFn' | 'onSuccess' | 'onError'
  >
}

export type HttpRestTanstackMutationOutcome<Data, Variables> = {
  states: {
    status: MutationStatus
    success: boolean
    failed: boolean
    pending: boolean
    idle: boolean
  }
  responses: {
    success: Success<Data> | undefined
    failed: Failed | null
  }
  handlers: {
    fire: (variables: Variables) => void
    execute: (variables: Variables) => Promise<Outcome<Data>>
    reset: () => void
  }
}
