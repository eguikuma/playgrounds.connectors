import { useQueryClient, useMutation } from '@tanstack/react-query'

import {
  type Failed,
  failify,
  isString,
  type Method,
  type Outcomer,
  type RequestBody,
  type Success,
  unify,
} from '@outcomify/requestify'

import { timestamps } from '../../../helpers/invalidator'
import type {
  HttpRestTanstackMutation,
  HttpRestTanstackMutationOutcome,
  HttpRestTanstackMutationParameters,
  HttpRestTanstackMutationSource,
} from '../../../models/mutation'

export const createMutation =
  <Base extends string>(
    outcomer: Outcomer<Base>,
    method: Exclude<Method, 'GET'>,
  ): HttpRestTanstackMutation<Base> =>
  <Data, Variables extends RequestBody = RequestBody>(
    source: HttpRestTanstackMutationSource<Base, Data, Variables>,
    parameters: HttpRestTanstackMutationParameters<Data, Variables>,
  ): HttpRestTanstackMutationOutcome<Data, Variables> => {
    const { key, success, failed, invalidates, options, extras } = parameters
    const cache = useQueryClient()

    const response = useMutation<Success<Data>, Failed, Variables>({
      mutationKey: key,
      mutationFn: async (variables: Variables) => {
        const response = await unify<Base, Data, [Variables]>({
          source,
          parameters: [variables],
          executor: (endpoint) =>
            outcomer.send<Data>(
              method,
              endpoint,
              method === 'DELETE' ? undefined : variables,
              options,
            ),
          verify: options?.verify,
        })

        if (!response.success) {
          throw response
        }

        return response
      },
      onSuccess: (data, variables) => {
        if (invalidates) {
          for (const filter of invalidates) {
            if (isString(filter)) {
              timestamps.mark([filter])

              cache.invalidateQueries({ queryKey: [filter] })
            } else if (Array.isArray(filter)) {
              timestamps.mark(filter)

              cache.invalidateQueries({ queryKey: filter })
            } else {
              timestamps.mark(filter.key)

              cache.invalidateQueries({
                queryKey: filter.key,
                type: filter.mode,
                exact: filter.exact,
                refetchType: filter.refetch,
                stale: filter.stale,
                fetchStatus: filter.status,
                predicate: filter.predicate,
              })
            }
          }
        }

        success?.(data, variables)
      },
      onError: (data, variables) => failed?.(data, variables),
      ...extras,
    })

    return {
      states: {
        status: response.status,
        success: response.isSuccess,
        failed: response.isError,
        pending: response.isPending,
        idle: response.isIdle,
      },
      responses: {
        success: response.data,
        failed: response.error,
      },
      handlers: {
        fire: response.mutate,
        execute: async (variables: Variables) => {
          try {
            return await response.mutateAsync(variables)
          } catch (thrown) {
            return await failify(thrown)
          }
        },
        reset: response.reset,
      },
    }
  }
