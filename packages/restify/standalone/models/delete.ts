import type { Endpoint, LocalOptions, Outcome } from '@outcomify/requestify'

export type HttpRestStandaloneDelete<Base extends string> = {
  <Data>(action: () => Promise<Outcome<Data>>, options?: LocalOptions<Data>): Promise<Outcome<Data>>
  <Data>(endpoint: Endpoint<Base>, options?: LocalOptions<Data>): Promise<Outcome<Data>>
  <Data>(
    source: HttpRestStandaloneDeleteSource<Base, Data>,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>>
}

export type HttpRestStandaloneDeleteSource<Base extends string, Data = unknown> =
  | Endpoint<Base>
  | (() => Promise<Outcome<Data>>)
