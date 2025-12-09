import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query'

import {
  asThis,
  type Failed,
  type Outcomer,
  type Success,
  successify,
  unify,
} from '@outcomify/requestify'

import { staleness } from '../../../helpers/invalidator'
import type {
  HttpRestTanstackInfiniteQuery,
  HttpRestTanstackInfiniteQueryOutcome,
  HttpRestTanstackInfiniteQueryParameters,
  HttpRestTanstackInfiniteQuerySource,
  HttpRestTanstackInfiniteQueryVariables,
} from '../../../models/infinite'

export const createInfiniteQuery =
  <Base extends string>(request: Outcomer<Base>): HttpRestTanstackInfiniteQuery<Base> =>
  <Data, Original = Data, Variables = HttpRestTanstackInfiniteQueryVariables>(
    source: HttpRestTanstackInfiniteQuerySource<Base, Original, Variables>,
    parameters: HttpRestTanstackInfiniteQueryParameters<Data, Original, Variables> & {
      next: (parameters: {
        last: Success<Data>
        pages: Success<Data>[]
        variables: Variables | HttpRestTanstackInfiniteQueryVariables
      }) => Variables | undefined
      transform?: (
        original: Original,
        variables: Variables | HttpRestTanstackInfiniteQueryVariables,
      ) => Data
    },
  ): HttpRestTanstackInfiniteQueryOutcome<Data> => {
    const {
      key,
      stale,
      enabled,
      defaults,
      variables = { page: 0 },
      options,
      extras,
      transform,
      next,
    } = parameters

    const response = useInfiniteQuery<
      Success<Data>,
      Failed,
      InfiniteData<Success<Data>, Variables | HttpRestTanstackInfiniteQueryVariables>,
      unknown[],
      Variables | HttpRestTanstackInfiniteQueryVariables
    >({
      queryKey: key,
      queryFn: async (context) => {
        const parameters = asThis<Variables>(context.pageParam ?? variables)

        const response = await unify<Base, Original, [Variables]>({
          source,
          parameters: [parameters],
          executor: (endpoint) => request.send<Original>('GET', endpoint, undefined, options),
        })

        if (!response.success) {
          throw response
        }

        return transform
          ? successify(transform(response.data, parameters), response.status)
          : asThis<Success<Data>>(response)
      },
      getNextPageParam: (last, pages, variables) => next({ last, pages, variables }),
      initialPageParam: variables,
      initialData:
        defaults && transform
          ? {
              pages: [successify(transform(defaults, variables))],
              pageParams: [variables],
            }
          : defaults != null
            ? {
                pages: [successify(asThis<Data>(defaults))],
                pageParams: [variables],
              }
            : undefined,
      initialDataUpdatedAt: defaults ? 0 : undefined,
      staleTime: staleness(key, stale ?? (defaults ? Infinity : undefined)),
      enabled,
      ...extras,
    })

    return {
      states: {
        status: response.status,
        success: response.isSuccess,
        failed: response.isError,
        pending: response.isPending,
        loading: response.isLoading,
        fetching: response.isFetching,
        paging: response.isFetchingNextPage,
        more: response.hasNextPage || false,
        refetching: response.isRefetching,
        stale: response.isStale,
      },
      responses: {
        success: response.data?.pages ?? [],
        failed: response.error,
      },
      handlers: {
        next: () =>
          response.hasNextPage && !response.isFetchingNextPage && response.fetchNextPage(),
        refetch: response.refetch,
      },
    }
  }
