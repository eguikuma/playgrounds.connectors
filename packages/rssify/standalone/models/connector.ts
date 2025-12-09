import type { DeepExact, DefaultBase, ExtendedBase, GlobalOptions } from '@outcomify/requestify'

import type { HttpRssStandaloneGet } from './get'

export type HttpRssStandaloneMethods<Base extends string> = {
  get: HttpRssStandaloneGet<Base>
}

export type HttpRssStandaloneConnector<Base extends string = DefaultBase> =
  HttpRssStandaloneMethods<Base> & {
    extend: <const Extended extends Partial<GlobalOptions>>(
      extended: DeepExact<Partial<GlobalOptions>, Extended>,
    ) => HttpRssStandaloneConnector<ExtendedBase<Base, Extended>>
  }
