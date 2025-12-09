import {
  type LocalOptions,
  type Outcome,
  type Outcomer,
  type RequestBody,
  unify,
} from '@outcomify/requestify'

import type { HttpRestStandalonePut, HttpRestStandalonePutSource } from '../../models/put'

export const createPut =
  <Base extends string>(outcomer: Outcomer<Base>): HttpRestStandalonePut<Base> =>
  <Data, Body extends RequestBody = RequestBody>(
    source: HttpRestStandalonePutSource<Base, Data, Body>,
    body?: Body,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>> =>
    unify<Base, Data, [Body?]>({
      source,
      parameters: [body],
      executor: (endpoint) => outcomer.send<Data>('PUT', endpoint, body, options),
      verify: options?.verify,
    })
