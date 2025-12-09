import { type LocalOptions, type Outcome, type Outcomer, unify } from '@outcomify/requestify'

import type { HttpRestStandaloneDelete, HttpRestStandaloneDeleteSource } from '../../models/delete'

export const createDelete =
  <Base extends string>(outcomer: Outcomer<Base>): HttpRestStandaloneDelete<Base> =>
  <Data>(
    source: HttpRestStandaloneDeleteSource<Base, Data>,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>> =>
    unify<Base, Data, []>({
      source,
      executor: (endpoint) => outcomer.send<Data>('DELETE', endpoint, undefined, options),
      verify: options?.verify,
    })
