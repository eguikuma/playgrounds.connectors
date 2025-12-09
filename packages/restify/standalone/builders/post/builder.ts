import {
  type LocalOptions,
  type Outcome,
  type Outcomer,
  type RequestBody,
  unify,
} from '@outcomify/requestify'

import type { HttpRestStandalonePost, HttpRestStandalonePostSource } from '../../models/post'

export const createPost =
  <Base extends string>(outcomer: Outcomer<Base>): HttpRestStandalonePost<Base> =>
  <Data, Body extends RequestBody = RequestBody>(
    source: HttpRestStandalonePostSource<Base, Data, Body>,
    body?: Body,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>> =>
    unify<Base, Data, [Body?]>({
      source,
      parameters: [body],
      executor: (endpoint) => outcomer.send<Data>('POST', endpoint, body, options),
      verify: options?.verify,
    })
