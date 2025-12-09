import type { LocalOptions } from './options'

export type DefaultBase = '/'

export type Endpoint<Base extends string> = string & { readonly __base?: Base }

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type RequestBody = BodyInit | object

export type RequestContext<Data = unknown> = {
  method: Method
  endpoint: string
  options: Omit<
    LocalOptions<Data>,
    'interceptors' | 'on' | 'status' | 'verify' | 'queries' | 'base' | 'unsafe'
  > & {
    interceptors?: never
    on?: never
    status?: never
    verify?: never
    queries?: never
    base?: never
    unsafe?: never
  }
  body?: RequestBody
}

export type RequestInterceptor<Data = unknown> = (
  context: RequestContext<Data>,
) => RequestContext<Data> | Promise<RequestContext<Data>>
