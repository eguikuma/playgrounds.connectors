import type { Endpoint, LocalOptions, Outcome } from '@outcomify/requestify'

export type HttpRestStandaloneGet<Base extends string> = {
  <Data>(action: () => Promise<Outcome<Data>>, options?: LocalOptions<Data>): Promise<Outcome<Data>>
  <Data>(endpoint: Endpoint<Base>, options?: LocalOptions<Data>): Promise<Outcome<Data>>
  <Data>(
    source: HttpRestStandaloneGetSource<Base, Data>,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>>
}

export type HttpRestStandaloneGetSource<Base extends string, Data = unknown> =
  | Endpoint<Base>
  | (() => Promise<Outcome<Data>>)
