import type { DeepExact, DefaultBase, ExtendedBase, GlobalOptions } from '@outcomify/requestify'

import type { HttpRssTanstackInfiniteQuery } from './infinite'
import type { HttpRssTanstackQuery } from './query'

export type HttpRssTanstackMethods<Base extends string> = {
  useGet: HttpRssTanstackQuery<Base>
  useInfinite: HttpRssTanstackInfiniteQuery<Base>
}

export type HttpRssTanstackConnector<Base extends string = DefaultBase> =
  HttpRssTanstackMethods<Base> & {
    extend: <const Extended extends Partial<GlobalOptions>>(
      extended: DeepExact<Partial<GlobalOptions>, Extended>,
    ) => HttpRssTanstackConnector<ExtendedBase<Base, Extended>>
  }
