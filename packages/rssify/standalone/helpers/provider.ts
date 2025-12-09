import {
  type DeepExact,
  type DefaultBase,
  type ExtendedBase,
  type GlobalOptions,
  mixin,
} from '@outcomify/requestify'
import { create, type HttpRestStandaloneConnector } from '@outcomify/restify'

import type { HttpRssStandaloneConnector, HttpRssStandaloneMethods } from '../models/connector'
import { FeedParser } from '../services/parse/parser'

export const provide =
  (
    builder: <Base extends string>(
      http: HttpRestStandaloneConnector<Base>,
      parser: FeedParser,
    ) => HttpRssStandaloneMethods<Base>,
  ) =>
  <const Options extends Partial<GlobalOptions>>(
    options?: DeepExact<Partial<GlobalOptions>, Options>,
  ): HttpRssStandaloneConnector<ExtendedBase<DefaultBase, Options>> => {
    const build = <Base extends string>(
      http: HttpRestStandaloneConnector<Base>,
    ): HttpRssStandaloneConnector<Base> => {
      const parser = new FeedParser()

      return {
        ...builder(http, parser),
        extend: <const Extended extends Partial<GlobalOptions>>(
          extended: DeepExact<Partial<GlobalOptions>, Extended>,
        ) => build(http.extend(extended)),
      }
    }

    return build(
      create(
        mixin(options, {
          headers: {
            Accept: 'application/rss+xml, application/xml, text/xml',
            'User-Agent': 'Mozilla/5.0 (compatible; RSSReader/1.0)',
          },
        }),
      ),
    )
  }
