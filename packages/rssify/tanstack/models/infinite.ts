import type {
  HttpRestTanstackInfiniteQueryOutcome,
  HttpRestTanstackInfiniteQueryParameters,
  HttpRestTanstackInfiniteQuerySource,
} from '@outcomify/restify-tanstack/react'
import type { Entry, Feed } from '@outcomify/rssify'

export type PagedFeed = {
  total: number
  next?: number
  entries: Entry[]
}

export type HttpRssTanstackInfiniteQuery<Base extends string> = {
  (
    parameters: HttpRssTanstackInfiniteQuerySourcelessParameters,
  ): HttpRssTanstackInfiniteQueryOutcome
  (
    source: HttpRssTanstackInfiniteQuerySource<Base>,
    parameters: HttpRssTanstackInfiniteQueryParameters,
  ): HttpRssTanstackInfiniteQueryOutcome
}

export type HttpRssTanstackInfiniteQuerySource<Base extends string> =
  HttpRestTanstackInfiniteQuerySource<Base, Feed>

export type HttpRssTanstackInfiniteQueryParameters = HttpRestTanstackInfiniteQueryParameters<
  PagedFeed,
  Feed
> & {
  size: number
}

export type HttpRssTanstackInfiniteQuerySourcelessParameters =
  HttpRssTanstackInfiniteQueryParameters & {
    defaults: Feed
  }

export type HttpRssTanstackInfiniteQueryOutcome = HttpRestTanstackInfiniteQueryOutcome<PagedFeed>
