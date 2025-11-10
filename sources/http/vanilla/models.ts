import type {
  DeepExact,
  Endpoint,
  ExtendedBase,
  GlobalOptions,
  LocalOptions,
  Outcome,
  RequestBody,
} from '../core/models'

export type HttpVanillaGetSource<Base extends string, Data = unknown> =
  | Endpoint<Base>
  | (() => Promise<Outcome<Data>>)

export type HttpVanillaGetOptions<Data> = LocalOptions<Data>

export type HttpVanillaGet<Base extends string, Data> = (
  source: HttpVanillaGetSource<Base, Data>,
  options?: HttpVanillaGetOptions<Data>,
) => Promise<Outcome<Data>>

export type HttpVanillaPostSource<
  Base extends string,
  Data = unknown,
  Body extends RequestBody = RequestBody,
> = Endpoint<Base> | ((body?: Body) => Promise<Outcome<Data>>)

export type HttpVanillaPostOptions<Data> = LocalOptions<Data>

export type HttpVanillaPost<Base extends string, Data, Body extends RequestBody = RequestBody> = (
  source: HttpVanillaPostSource<Base, Data, Body>,
  body?: Body,
  options?: HttpVanillaPostOptions<Data>,
) => Promise<Outcome<Data>>

export type HttpVanillaPutSource<
  Base extends string,
  Data = unknown,
  Body extends RequestBody = RequestBody,
> = Endpoint<Base> | ((body?: Body) => Promise<Outcome<Data>>)

export type HttpVanillaPutOptions<Data> = LocalOptions<Data>

export type HttpVanillaPut<Base extends string, Data, Body extends RequestBody = RequestBody> = (
  source: HttpVanillaPutSource<Base, Data, Body>,
  body?: Body,
  options?: HttpVanillaPutOptions<Data>,
) => Promise<Outcome<Data>>

export type HttpVanillaPatchSource<
  Base extends string,
  Data = unknown,
  Body extends RequestBody = RequestBody,
> = Endpoint<Base> | ((body?: Body) => Promise<Outcome<Data>>)

export type HttpVanillaPatchOptions<Data> = LocalOptions<Data>

export type HttpVanillaPatch<Base extends string, Data, Body extends RequestBody = RequestBody> = (
  source: HttpVanillaPatchSource<Base, Data, Body>,
  body?: Body,
  options?: HttpVanillaPatchOptions<Data>,
) => Promise<Outcome<Data>>

export type HttpVanillaDeleteSource<Base extends string, Data = unknown> =
  | Endpoint<Base>
  | (() => Promise<Outcome<Data>>)

export type HttpVanillaDeleteOptions<Data> = LocalOptions<Data>

export type HttpVanillaDelete<Base extends string, Data> = (
  source: HttpVanillaDeleteSource<Base, Data>,
  options?: HttpVanillaDeleteOptions<Data>,
) => Promise<Outcome<Data>>

export type HttpVanillaMethods<Base extends string> = {
  get: {
    <Data>(
      action: () => Promise<Outcome<Data>>,
      options?: HttpVanillaGetOptions<Data>,
    ): Promise<Outcome<Data>>
    <Data>(endpoint: Endpoint<Base>, options?: HttpVanillaGetOptions<Data>): Promise<Outcome<Data>>
  }
  post: {
    <Data, Body extends RequestBody = RequestBody>(
      action: (body?: Body) => Promise<Outcome<Data>>,
      body?: Body,
      options?: HttpVanillaPostOptions<Data>,
    ): Promise<Outcome<Data>>
    <Data, Body extends RequestBody = RequestBody>(
      endpoint: Endpoint<Base>,
      body?: Body,
      options?: HttpVanillaPostOptions<Data>,
    ): Promise<Outcome<Data>>
  }
  put: {
    <Data, Body extends RequestBody = RequestBody>(
      action: (body?: Body) => Promise<Outcome<Data>>,
      body?: Body,
      options?: HttpVanillaPutOptions<Data>,
    ): Promise<Outcome<Data>>
    <Data, Body extends RequestBody = RequestBody>(
      endpoint: Endpoint<Base>,
      body?: Body,
      options?: HttpVanillaPutOptions<Data>,
    ): Promise<Outcome<Data>>
  }
  patch: {
    <Data, Body extends RequestBody = RequestBody>(
      action: (body?: Body) => Promise<Outcome<Data>>,
      body?: Body,
      options?: HttpVanillaPatchOptions<Data>,
    ): Promise<Outcome<Data>>
    <Data, Body extends RequestBody = RequestBody>(
      endpoint: Endpoint<Base>,
      body?: Body,
      options?: HttpVanillaPatchOptions<Data>,
    ): Promise<Outcome<Data>>
  }
  delete: {
    <Data>(
      action: () => Promise<Outcome<Data>>,
      options?: HttpVanillaDeleteOptions<Data>,
    ): Promise<Outcome<Data>>
    <Data>(
      endpoint: Endpoint<Base>,
      options?: HttpVanillaDeleteOptions<Data>,
    ): Promise<Outcome<Data>>
  }
}

export type HttpVanillaBuilder<Base extends string> = HttpVanillaMethods<Base> & {
  extend: <const Extended extends Partial<GlobalOptions>>(
    extended: DeepExact<Partial<GlobalOptions>, Extended>,
  ) => HttpVanillaBuilder<ExtendedBase<Base, Extended>>
}
