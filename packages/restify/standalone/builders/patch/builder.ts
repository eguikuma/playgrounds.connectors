import {
  type LocalOptions,
  type Outcome,
  type Outcomer,
  type RequestBody,
  unify,
} from '@outcomify/requestify'

import type { HttpRestStandalonePatch, HttpRestStandalonePatchSource } from '../../models/patch'

export const createPatch =
  <Base extends string>(outcomer: Outcomer<Base>): HttpRestStandalonePatch<Base> =>
  <Data, Body extends RequestBody = RequestBody>(
    source: HttpRestStandalonePatchSource<Base, Data, Body>,
    body?: Body,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>> =>
    unify<Base, Data, [Body?]>({
      source,
      parameters: [body],
      executor: (endpoint) => outcomer.send<Data>('PATCH', endpoint, body, options),
      verify: options?.verify,
    })
