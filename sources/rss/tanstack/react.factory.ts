'use client'

import type { RssTanstackBuilder } from './models'
import { successify, unify } from '../../http/core/helpers'
import type { DefaultBase, DeepExact, ExtendedBase, GlobalOptions } from '../../http/core/models'
import { factory as http } from '../../http/tanstack'
import type {
  HttpTanstackBuilder,
  HttpTanstackInfiniteQueryOutcome,
  HttpTanstackInfiniteQueryParameters,
  HttpTanstackInfiniteQuerySource,
  HttpTanstackInfiniteQueryVariables,
  HttpTanstackQueryOutcome,
  HttpTanstackQueryParameters,
} from '../../http/tanstack/models'
import type { Feed, PagedFeed } from '../core/models'
import { factory as rss } from '../vanilla'
import type { RssVanillaBuilder, RssVanillaGetSource } from '../vanilla/models'

export const factory = <const Options extends Partial<GlobalOptions>>(
  options?: DeepExact<Partial<GlobalOptions>, Options>,
): RssTanstackBuilder<ExtendedBase<DefaultBase, Options>> => builder(rss(options), http(options))

const builder = <Base extends string>(
  rss: RssVanillaBuilder<Base>,
  http: HttpTanstackBuilder<Base>,
): RssTanstackBuilder<Base> => {
  const get = (
    source: RssVanillaGetSource<Base>,
    parameters: HttpTanstackQueryParameters<Feed>,
  ): HttpTanstackQueryOutcome<Feed> => http.get(() => rss.get(source), parameters)

  const infinite = (
    source: HttpTanstackInfiniteQuerySource<Base, Feed>,
    parameters: HttpTanstackInfiniteQueryParameters<Feed> & { size: number },
  ): HttpTanstackInfiniteQueryOutcome<PagedFeed> => {
    let cached: Feed | null = null

    const { size, defaults, ...rest } = parameters

    return http.infinite<PagedFeed, Feed>(
      async (variables) => {
        if (!cached) {
          const response = await unify<Base, Feed, [HttpTanstackInfiniteQueryVariables]>({
            source,
            parameters: [{ page: variables.page }],
            executor: (endpoint) => rss.get(endpoint),
          })

          if (!response.success) {
            return response
          }

          cached = response.data
        }

        return successify(cached)
      },
      {
        ...rest,
        defaults,
        transform: (feed, variables) => {
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

  return {
    get,
    infinite,
    extend: <const Extended extends Partial<GlobalOptions>>(
      extended: DeepExact<Partial<GlobalOptions>, Extended>,
    ) => builder(rss.extend(extended), http.extend(extended)),
  }
}
