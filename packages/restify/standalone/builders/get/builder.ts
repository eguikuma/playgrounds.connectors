import { type LocalOptions, type Outcome, type Outcomer, unify } from '@outcomify/requestify'

import type { HttpRestStandaloneGet, HttpRestStandaloneGetSource } from '../../models/get'

export const createGet =
  <Base extends string>(outcomer: Outcomer<Base>): HttpRestStandaloneGet<Base> =>
  <Data>(
    source: HttpRestStandaloneGetSource<Base, Data>,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>> =>
    unify<Base, Data, []>({
      source,
      executor: (endpoint) => outcomer.send<Data>('GET', endpoint, undefined, options),
      verify: options?.verify,
    })
