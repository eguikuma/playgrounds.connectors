import { getReasonPhrase, StatusCodes } from 'http-status-codes'

import type { RssVanillaBuilder, RssVanillaGetSource } from './models'
import { mixin, unify } from '../../http/core/helpers'
import type {
  DefaultBase,
  DeepExact,
  ExtendedBase,
  GlobalOptions,
  Outcome,
} from '../../http/core/models'
import { factory as http } from '../../http/vanilla'
import type { HttpVanillaBuilder } from '../../http/vanilla/models'
import type { Feed } from '../core/models'
import { FeedParser } from '../core/parser'

export const factory = <const Options extends Partial<GlobalOptions>>(
  options?: DeepExact<Partial<GlobalOptions>, Options>,
): RssVanillaBuilder<ExtendedBase<DefaultBase, Options>> =>
  builder(
    http(
      mixin(options, {
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (compatible; RSSReader/1.0)',
        },
      }),
    ),
  )

const builder = <Base extends string>(http: HttpVanillaBuilder<Base>): RssVanillaBuilder<Base> => {
  const parser = new FeedParser()

  const get = async (source: RssVanillaGetSource<Base>): Promise<Outcome<Feed>> => {
    const response = await unify<Base, string, []>({
      source,
      executor: (endpoint) => http.get(endpoint),
    })

    if (!response.success) {
      return response
    }

    try {
      const feed = await parser.parse(response.data)

      return {
        success: true,
        status: response.status,
        data: feed,
      }
    } catch (thrown) {
      return {
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message:
          thrown instanceof Error
            ? thrown.message
            : getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      }
    }
  }

  return {
    get,
    extend: <const Extended extends Partial<GlobalOptions>>(
      extended: DeepExact<Partial<GlobalOptions>, Extended>,
    ) => builder(http.extend(extended)),
  }
}
