'use client'

import type { InfiniteData } from '@tanstack/query-core'
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'

import { to } from './helpers'
import type {
  HttpTanstackBuilder,
  HttpTanstackInfiniteQueryOutcome,
  HttpTanstackInfiniteQueryParameters,
  HttpTanstackInfiniteQuerySource,
  HttpTanstackInfiniteQueryVariables,
  HttpTanstackMutationOutcome,
  HttpTanstackMutationParameters,
  HttpTanstackMutationSource,
  HttpTanstackQueryOutcome,
  HttpTanstackQueryParameters,
  HttpTanstackQuerySource,
} from './models'
import { asThis, isThis, successify, unify } from '../core/helpers'
import type {
  DefaultBase,
  DeepExact,
  ExtendedBase,
  Failed,
  GlobalOptions,
  Method,
  RequestBody,
  Success,
} from '../core/models'
import { factory as request } from '../core/request'
import type { Request } from '../core/request'
import { execute } from '../vanilla/helpers'

export const factory = <const Options extends Partial<GlobalOptions>>(
  options?: DeepExact<Partial<GlobalOptions>, Options>,
): HttpTanstackBuilder<ExtendedBase<DefaultBase, Options>> => builder(request(options))

const builder = <Base extends string>(request: Request<Base>): HttpTanstackBuilder<Base> => ({
  get: getter(request),
  infinite: infiniter(request),
  post: poster(request),
  put: putter(request),
  patch: patcher(request),
  delete: deleter(request),
  extend: <const Extended extends Partial<GlobalOptions>>(
    extended: DeepExact<Partial<GlobalOptions>, Extended>,
  ) => builder(request.extend(extended)),
})

const getter =
  <Base extends string>(request: Request<Base>) =>
  <Data>(
    source: HttpTanstackQuerySource<Base, Data>,
    parameters: HttpTanstackQueryParameters<Data>,
  ): HttpTanstackQueryOutcome<Data> => {
    const { key, enabled, defaults, options, extras } = parameters

    const response = useQuery<Success<Data>, Failed>({
      queryKey: key,
      queryFn: async () => {
        const response = await unify<Base, Data, []>({
          source,
          executor: (endpoint) => execute<Base, Data>(request, 'GET', endpoint, undefined, options),
          verify: options?.verify,
        })

        if (!response.success) {
          throw response
        }

        return response
      },
      enabled,
      initialData: defaults ? successify(defaults) : undefined,
      ...extras,
    })

    return to.query(response)
  }

const infiniter =
  <Base extends string>(request: Request<Base>) =>
  <Data, Original = Data, Variables = HttpTanstackInfiniteQueryVariables>(
    source: HttpTanstackInfiniteQuerySource<Base, Original, Variables>,
    parameters: HttpTanstackInfiniteQueryParameters<Data, Original, Variables> & {
      next: (parameters: {
        last: Success<Data>
        pages: Success<Data>[]
        variables: Variables | HttpTanstackInfiniteQueryVariables
      }) => Variables | undefined
      transform?: (
        original: Original,
        variables: Variables | HttpTanstackInfiniteQueryVariables,
      ) => Data
    },
  ): HttpTanstackInfiniteQueryOutcome<Data> => {
    const { key, enabled, defaults, variables = { page: 0 }, transform, next } = parameters

    const response = useInfiniteQuery<
      Success<Data>,
      Failed,
      InfiniteData<Success<Data>, Variables | HttpTanstackInfiniteQueryVariables>,
      unknown[],
      Variables | HttpTanstackInfiniteQueryVariables
    >({
      queryKey: key,
      queryFn: async (context) => {
        const parameters = asThis<Variables>(context.pageParam ?? variables)

        const response = await unify<Base, Original, [Variables]>({
          source,
          parameters: [parameters],
          executor: (endpoint) =>
            execute<Base, Original>(request, 'GET', endpoint, undefined, undefined),
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
          : isThis<Data>(defaults)
            ? {
                pages: [successify(defaults)],
                pageParams: [variables],
              }
            : undefined,
      enabled,
    })

    return to.infinite(response)
  }

const mutator = <Base extends string, Data, Variables extends RequestBody = RequestBody>(
  request: Request<Base>,
  method: Exclude<Method, 'GET'>,
  source: HttpTanstackMutationSource<Base, Data, Variables>,
  parameters: HttpTanstackMutationParameters<Data, Variables>,
): HttpTanstackMutationOutcome<Data, Variables> => {
  const { key, success, failed, invalidates, options, extras } = parameters
  const cache = useQueryClient()

  const response = useMutation<Success<Data>, Failed, Variables>({
    mutationKey: key,
    mutationFn: async (variables: Variables) => {
      const response = await unify<Base, Data, [Variables]>({
        source,
        parameters: [variables],
        executor: (endpoint) => execute<Base, Data>(request, method, endpoint, variables, options),
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
          if (Array.isArray(filter)) {
            cache.invalidateQueries({ queryKey: filter })
          } else {
            cache.invalidateQueries({ queryKey: filter.key, type: filter.mode })
          }
        }
      }

      success?.(data, variables)
    },
    onError: (data, variables) => failed?.(data, variables),
    ...extras,
  })

  return to.mutation(response)
}

const poster =
  <Base extends string>(request: Request<Base>) =>
  <Data, Variables extends RequestBody = RequestBody>(
    source: HttpTanstackMutationSource<Base, Data, Variables>,
    parameters: HttpTanstackMutationParameters<Data, Variables>,
  ) =>
    mutator(request, 'POST', source, parameters)

const putter =
  <Base extends string>(request: Request<Base>) =>
  <Data, Variables extends RequestBody = RequestBody>(
    source: HttpTanstackMutationSource<Base, Data, Variables>,
    parameters: HttpTanstackMutationParameters<Data, Variables>,
  ) =>
    mutator(request, 'PUT', source, parameters)

const patcher =
  <Base extends string>(request: Request<Base>) =>
  <Data, Variables extends RequestBody = RequestBody>(
    source: HttpTanstackMutationSource<Base, Data, Variables>,
    parameters: HttpTanstackMutationParameters<Data, Variables>,
  ) =>
    mutator(request, 'PATCH', source, parameters)

const deleter =
  <Base extends string>(request: Request<Base>) =>
  <Data, Variables extends RequestBody = RequestBody>(
    source: HttpTanstackMutationSource<Base, Data, Variables>,
    parameters: HttpTanstackMutationParameters<Data, Variables>,
  ) =>
    mutator(request, 'DELETE', source, parameters)
