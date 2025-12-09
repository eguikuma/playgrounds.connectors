import type { DeepExact, DefaultBase, ExtendedBase, GlobalOptions } from '@outcomify/requestify'
import { create as http, type HttpRestTanstackConnector } from '@outcomify/restify-tanstack/react'
import { create as rss, type HttpRssStandaloneConnector } from '@outcomify/rssify'

import type { HttpRssTanstackConnector, HttpRssTanstackMethods } from '../models/connector'

export const provide =
  (
    builder: <Base extends string>(
      rss: HttpRssStandaloneConnector<Base>,
      http: HttpRestTanstackConnector<Base>,
    ) => HttpRssTanstackMethods<Base>,
  ) =>
  <const Options extends Partial<GlobalOptions>>(
    options?: DeepExact<Partial<GlobalOptions>, Options>,
  ): HttpRssTanstackConnector<ExtendedBase<DefaultBase, Options>> => {
    const build = <Base extends string>(
      rss: HttpRssStandaloneConnector<Base>,
      http: HttpRestTanstackConnector<Base>,
    ): HttpRssTanstackConnector<Base> => ({
      ...builder(rss, http),
      extend: <const Extended extends Partial<GlobalOptions>>(
        extended: DeepExact<Partial<GlobalOptions>, Extended>,
      ) => build(rss.extend(extended), http.extend(extended)),
    })

    return build(rss(options), http(options))
  }
