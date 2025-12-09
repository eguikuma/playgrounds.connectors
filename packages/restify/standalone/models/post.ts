import type { Endpoint, LocalOptions, Outcome, RequestBody } from '@outcomify/requestify'

export type HttpRestStandalonePost<Base extends string> = {
  <Data, Body extends RequestBody = RequestBody>(
    action: (body?: Body) => Promise<Outcome<Data>>,
    body?: Body,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>>
  <Data, Body extends RequestBody = RequestBody>(
    endpoint: Endpoint<Base>,
    body?: Body,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>>
  <Data, Body extends RequestBody = RequestBody>(
    source: HttpRestStandalonePostSource<Base, Data, Body>,
    body?: Body,
    options?: LocalOptions<Data>,
  ): Promise<Outcome<Data>>
}

export type HttpRestStandalonePostSource<
  Base extends string,
  Data = unknown,
  Body extends RequestBody = RequestBody,
> = Endpoint<Base> | ((body?: Body) => Promise<Outcome<Data>>)
