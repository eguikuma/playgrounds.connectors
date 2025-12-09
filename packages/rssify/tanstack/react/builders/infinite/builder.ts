'use client'

import { asThis, successify, unify } from '@outcomify/requestify'
import type {
  HttpRestTanstackConnector,
  HttpRestTanstackInfiniteQueryVariables,
} from '@outcomify/restify-tanstack/react'
import type { Feed, HttpRssStandaloneConnector } from '@outcomify/rssify'

import type {
  HttpRssTanstackInfiniteQuery,
  HttpRssTanstackInfiniteQueryOutcome,
  HttpRssTanstackInfiniteQueryParameters,
  HttpRssTanstackInfiniteQuerySource,
  HttpRssTanstackInfiniteQuerySourcelessParameters,
  PagedFeed,
} from '../../../models/infinite'

export const createInfiniteQuery =
  <Base extends string>(
    rss: HttpRssStandaloneConnector<Base>,
    http: HttpRestTanstackConnector<Base>,
  ): HttpRssTanstackInfiniteQuery<Base> =>
  (
    first:
      | HttpRssTanstackInfiniteQuerySource<Base>
      | HttpRssTanstackInfiniteQuerySourcelessParameters,
    second?: HttpRssTanstackInfiniteQueryParameters,
  ): HttpRssTanstackInfiniteQueryOutcome => {
    const source =
      second !== undefined ? asThis<HttpRssTanstackInfiniteQuerySource<Base>>(first) : undefined
    const parameters =
      second !== undefined
        ? second
        : asThis<HttpRssTanstackInfiniteQuerySourcelessParameters>(first)

    const { size, defaults, ...extras } = parameters

    return http.useInfinite<PagedFeed, Feed>(
      async (variables: HttpRestTanstackInfiniteQueryVariables) => {
        if (!source) {
          return successify(asThis<Feed>(defaults))
        }

        const response = await unify<Base, Feed, [HttpRestTanstackInfiniteQueryVariables]>({
          source,
          parameters: [{ page: variables.page }],
          executor: (endpoint) => rss.get(endpoint),
        })

        if (!response.success) {
          throw response
        }

        return successify(response.data)
      },
      {
        ...extras,
        defaults,
        transform: (feed: Feed, variables: HttpRestTanstackInfiniteQueryVariables): PagedFeed => {
          const start = variables.page * size
          const end = start + size

          return {
            entries: feed.entries.slice(start, end),
            total: feed.entries.length,
            next: end < feed.entries.length ? variables.page + 1 : undefined,
          }
        },
        next: ({ last }) => (last.data.next !== undefined ? { page: last.data.next } : undefined),
      },
    )
  }
