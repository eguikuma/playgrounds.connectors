import { useQuery } from '@tanstack/react-query'

import { type Failed, type Outcomer, type Success, successify, unify } from '@outcomify/requestify'

import { staleness } from '../../../helpers/invalidator'
import type {
  HttpRestTanstackQuery,
  HttpRestTanstackQueryOutcome,
  HttpRestTanstackQueryParameters,
  HttpRestTanstackQuerySource,
} from '../../../models/query'

export const createQuery =
  <Base extends string>(outcomer: Outcomer<Base>): HttpRestTanstackQuery<Base> =>
  <Data>(
    source: HttpRestTanstackQuerySource<Base, Data>,
    parameters: HttpRestTanstackQueryParameters<Data>,
  ): HttpRestTanstackQueryOutcome<Data> => {
    const { key, stale, enabled, defaults, options, extras } = parameters

    const response = useQuery<Success<Data>, Failed>({
      queryKey: key,
      queryFn: async () => {
        const response = await unify<Base, Data, []>({
          source,
          executor: (endpoint) => outcomer.send<Data>('GET', endpoint, undefined, options),
          verify: options?.verify,
        })

        if (!response.success) {
          throw response
        }

        return response
      },
      enabled,
      initialData: defaults ? successify(defaults) : undefined,
      initialDataUpdatedAt: defaults ? 0 : undefined,
      staleTime: staleness(key, stale ?? (defaults ? Infinity : undefined)),
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
        refetching: response.isRefetching,
        stale: response.isStale,
      },
      responses: {
        success: response.data,
        failed: response.error,
      },
      handlers: {
        refetch: response.refetch,
      },
    }
  }
