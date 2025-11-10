import { execute } from './helpers'
import type {
  HttpVanillaBuilder,
  HttpVanillaDeleteOptions,
  HttpVanillaDeleteSource,
  HttpVanillaGetOptions,
  HttpVanillaGetSource,
  HttpVanillaPatchOptions,
  HttpVanillaPatchSource,
  HttpVanillaPostOptions,
  HttpVanillaPostSource,
  HttpVanillaPutOptions,
  HttpVanillaPutSource,
} from './models'
import type {
  DefaultBase,
  DeepExact,
  ExtendedBase,
  GlobalOptions,
  Outcome,
  RequestBody,
} from '../core/models'
import { factory as request } from '../core/request'
import type { Request } from '../core/request'

export const factory = <const Options extends Partial<GlobalOptions>>(
  options?: DeepExact<Partial<GlobalOptions>, Options>,
): HttpVanillaBuilder<ExtendedBase<DefaultBase, Options>> => builder(request(options))

const builder = <Base extends string>(request: Request<Base>): HttpVanillaBuilder<Base> => ({
  get: getter(request),
  post: poster(request),
  put: putter(request),
  delete: deleter(request),
  patch: patcher(request),
  extend: <const Extended extends Partial<GlobalOptions>>(
    extended: DeepExact<Partial<GlobalOptions>, Extended>,
  ) => builder(request.extend(extended)),
})

const getter =
  <Base extends string>(request: Request<Base>) =>
  <Data>(
    source: HttpVanillaGetSource<Base, Data>,
    options?: HttpVanillaGetOptions<Data>,
  ): Promise<Outcome<Data>> =>
    execute(request, 'GET', source, undefined, options)

const poster =
  <Base extends string>(request: Request<Base>) =>
  <Data, Body extends RequestBody = RequestBody>(
    source: HttpVanillaPostSource<Base, Data, Body>,
    body?: Body,
    options?: HttpVanillaPostOptions<Data>,
  ): Promise<Outcome<Data>> =>
    execute(request, 'POST', source, body, options)

const putter =
  <Base extends string>(request: Request<Base>) =>
  <Data, Body extends RequestBody = RequestBody>(
    source: HttpVanillaPutSource<Base, Data, Body>,
    body?: Body,
    options?: HttpVanillaPutOptions<Data>,
  ): Promise<Outcome<Data>> =>
    execute(request, 'PUT', source, body, options)

const patcher =
  <Base extends string>(request: Request<Base>) =>
  <Data, Body extends RequestBody = RequestBody>(
    source: HttpVanillaPatchSource<Base, Data, Body>,
    body?: Body,
    options?: HttpVanillaPatchOptions<Data>,
  ): Promise<Outcome<Data>> =>
    execute(request, 'PATCH', source, body, options)

const deleter =
  <Base extends string>(request: Request<Base>) =>
  <Data>(
    source: HttpVanillaDeleteSource<Base, Data>,
    options?: HttpVanillaDeleteOptions<Data>,
  ): Promise<Outcome<Data>> =>
    execute(request, 'DELETE', source, undefined, options)
