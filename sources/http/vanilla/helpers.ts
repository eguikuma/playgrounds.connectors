import type {
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
import { unify } from '../core/helpers'
import type { Endpoint, Method, Outcome, RequestBody } from '../core/models'
import type { Request } from '../core/request'

export const execute = async <Base extends string, Data, Body extends RequestBody = RequestBody>(
  request: Request<Base>,
  method: Method,
  source:
    | HttpVanillaGetSource<Base, Data>
    | HttpVanillaPostSource<Base, Data, Body>
    | HttpVanillaPutSource<Base, Data, Body>
    | HttpVanillaDeleteSource<Base, Data>
    | HttpVanillaPatchSource<Base, Data, Body>,
  body?: Body,
  options?:
    | HttpVanillaGetOptions<Data>
    | HttpVanillaPostOptions<Data>
    | HttpVanillaPutOptions<Data>
    | HttpVanillaDeleteOptions<Data>
    | HttpVanillaPatchOptions<Data>,
): Promise<Outcome<Data>> => {
  const handlers: Record<Method, (endpoint: Endpoint<Base>) => Promise<Outcome<Data>>> = {
    GET: (endpoint) => request.get<Data>(endpoint, options),
    POST: (endpoint) => request.post<Data>(endpoint, body, options),
    PUT: (endpoint) => request.put<Data>(endpoint, body, options),
    PATCH: (endpoint) => request.patch<Data>(endpoint, body, options),
    DELETE: (endpoint) => request.delete<Data>(endpoint, options),
  }

  return unify<Base, Data, [Body?]>({
    source,
    parameters: [body],
    executor: handlers[method],
    verify: options?.verify,
  })
}
