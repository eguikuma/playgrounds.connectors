import type { DeepExact, DefaultBase, ExtendedBase, GlobalOptions } from '@outcomify/requestify'

import type { HttpRestTanstackInfiniteQuery } from './infinite'
import type { HttpRestTanstackMutation } from './mutation'
import type { HttpRestTanstackQuery } from './query'

export type HttpRestTanstackMethods<Base extends string> = {
  useGet: HttpRestTanstackQuery<Base>
  useInfinite: HttpRestTanstackInfiniteQuery<Base>
  usePost: HttpRestTanstackMutation<Base>
  usePut: HttpRestTanstackMutation<Base>
  usePatch: HttpRestTanstackMutation<Base>
  useDelete: HttpRestTanstackMutation<Base>
}

export type HttpRestTanstackConnector<Base extends string = DefaultBase> =
  HttpRestTanstackMethods<Base> & {
    extend: <const Extended extends Partial<GlobalOptions>>(
      extended: DeepExact<Partial<GlobalOptions>, Extended>,
    ) => HttpRestTanstackConnector<ExtendedBase<Base, Extended>>
  }
