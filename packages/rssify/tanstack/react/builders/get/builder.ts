'use client'

import type { HttpRestTanstackConnector } from '@outcomify/restify-tanstack/react'
import type { HttpRssStandaloneConnector } from '@outcomify/rssify'

import type {
  HttpRssTanstackQuery,
  HttpRssTanstackQueryOutcome,
  HttpRssTanstackQueryParameters,
  HttpRssTanstackQuerySource,
} from '../../../models/query'

export const createQuery = <Base extends string>(
  rss: HttpRssStandaloneConnector<Base>,
  http: HttpRestTanstackConnector<Base>,
): HttpRssTanstackQuery<Base> => {
  return (
    source: HttpRssTanstackQuerySource<Base>,
    parameters: HttpRssTanstackQueryParameters,
  ): HttpRssTanstackQueryOutcome => http.useGet(() => rss.get(source), parameters)
}
