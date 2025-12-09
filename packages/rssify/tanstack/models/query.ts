import type {
  HttpRestTanstackQueryOutcome,
  HttpRestTanstackQueryParameters,
} from '@outcomify/restify-tanstack/react'
import type { Feed, HttpRssStandaloneGetSource } from '@outcomify/rssify'

export type HttpRssTanstackQuery<Base extends string> = (
  source: HttpRssTanstackQuerySource<Base>,
  parameters: HttpRssTanstackQueryParameters,
) => HttpRssTanstackQueryOutcome

export type HttpRssTanstackQuerySource<Base extends string> = HttpRssStandaloneGetSource<Base>

export type HttpRssTanstackQueryParameters = HttpRestTanstackQueryParameters<Feed>

export type HttpRssTanstackQueryOutcome = HttpRestTanstackQueryOutcome<Feed>
