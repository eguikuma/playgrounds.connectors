import type { QueryObserverResult } from '@tanstack/query-core'

import type {
  BaseTanstackInfiniteQueryOutcome,
  BaseTanstackMutationOutcome,
  HttpTanstackInfiniteQueryOutcome,
  HttpTanstackMutationOutcome,
  HttpTanstackQueryOutcome,
} from './models'
import { failify, isFailed } from '../core/helpers'
import type { Failed, Success } from '../core/models'

export const to = {
  query: <Data>(
    base: QueryObserverResult<Success<Data>, Failed>,
  ): HttpTanstackQueryOutcome<Data> => ({
    states: {
      status: base.status,
      success: base.isSuccess,
      failed: base.isError,
      pending: base.isPending,
      loading: base.isLoading,
      fetching: base.isFetching,
      refetching: base.isRefetching,
      stale: base.isStale,
    },
    responses: {
      success: base.data,
      failed: base.error,
    },
    handlers: {
      refetch: base.refetch,
    },
  }),
  infinite: <Data>(
    base: BaseTanstackInfiniteQueryOutcome<Data>,
  ): HttpTanstackInfiniteQueryOutcome<Data> => ({
    states: {
      status: base.status,
      success: base.isSuccess,
      failed: base.isError,
      pending: base.isPending,
      loading: base.isLoading,
      fetching: base.isFetching,
      paging: base.isFetchingNextPage,
      more: base.hasNextPage || false,
      refetching: base.isRefetching,
      stale: base.isStale,
    },
    responses: {
      success: base.data?.pages ?? [],
      failed: base.error,
    },
    handlers: {
      next: () => base.hasNextPage && !base.isFetchingNextPage && base.fetchNextPage(),
      refetch: base.refetch,
    },
  }),
  mutation: <Data, Variables>(
    base: BaseTanstackMutationOutcome<Data, Variables>,
  ): HttpTanstackMutationOutcome<Data, Variables> => ({
    states: {
      status: base.status,
      success: base.isSuccess,
      failed: base.isError,
      pending: base.isPending,
      idle: base.isIdle,
    },
    responses: {
      success: base.data,
      failed: base.error,
    },
    handlers: {
      fire: base.mutate,
      execute: async (variables: Variables) => {
        try {
          return await base.mutateAsync(variables)
        } catch (thrown) {
          if (isFailed(thrown)) {
            return thrown
          }

          return await failify(thrown)
        }
      },
      reset: base.reset,
    },
  }),
}
