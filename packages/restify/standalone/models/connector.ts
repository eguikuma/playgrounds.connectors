import type { DeepExact, DefaultBase, ExtendedBase, GlobalOptions } from '@outcomify/requestify'

import type { HttpRestStandaloneDelete } from './delete'
import type { HttpRestStandaloneGet } from './get'
import type { HttpRestStandalonePatch } from './patch'
import type { HttpRestStandalonePost } from './post'
import type { HttpRestStandalonePut } from './put'

export type HttpRestStandaloneMethods<Base extends string = DefaultBase> = {
  get: HttpRestStandaloneGet<Base>
  post: HttpRestStandalonePost<Base>
  put: HttpRestStandalonePut<Base>
  patch: HttpRestStandalonePatch<Base>
  delete: HttpRestStandaloneDelete<Base>
}

export type HttpRestStandaloneConnector<Base extends string = DefaultBase> =
  HttpRestStandaloneMethods<Base> & {
    extend: <const Extended extends Partial<GlobalOptions>>(
      extended: DeepExact<Partial<GlobalOptions>, Extended>,
    ) => HttpRestStandaloneConnector<ExtendedBase<Base, Extended>>
  }
