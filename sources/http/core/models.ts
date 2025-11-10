export type DefaultBase = '/'

export type Endpoint<Base extends string = string> = string & { readonly __base?: Base }

export type Success<Data> = {
  success: true
  status: number
  data: Data
}

export type Failed = {
  success: false
  status: number
  message: string
  body?: unknown
}

export type Outcome<Data> = Success<Data> | Failed

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type GlobalOptions = {
  base?: string
  timeout?: number
  headers?: HeadersInit
  credentials?: RequestCredentials
  redirect?: RequestRedirect
  unsafe?: boolean
  localhost?: boolean
  interceptors?: Interceptors
  on?: OnRule
  status?: StatusRule
}

export type LocalOptions<Data = unknown> = GlobalOptions &
  Omit<RequestInit, 'method' | 'body'> & {
    queries?: Record<string, string | number | boolean>
    verify?: VerifyRule<Data>
  }

export type RequestBody = BodyInit | object

export type RequestContext<Data = unknown> = {
  method: Method
  endpoint: string
  options: Omit<LocalOptions<Data>, 'interceptors' | 'on' | 'status' | 'verify'>
  body?: RequestBody
}

export type ResponseContext<Data = unknown> = {
  method: Method
  endpoint: string
  outcome: Outcome<Data>
  raw: Response | null
}

export type RequestInterceptor = <Data>(
  context: RequestContext<Data>,
) => RequestContext<Data> | Promise<RequestContext<Data>>

export type ResponseInterceptor = <Data>(
  context: ResponseContext<Data>,
) => ResponseContext<Data> | Promise<ResponseContext<Data>>

export type Interceptors = {
  request?: RequestInterceptor[]
  response?: ResponseInterceptor[]
}

export type VerifyRule<Data> = (data: Data) => boolean

export type OnRule<Data = unknown> = {
  success?: (data: Success<Data>) => void
  unauthorized?: (data: Failed) => void
  failed?: (data: Failed) => void
}

export type StatusRuleSet = {
  success?: number[]
  failed?: number[]
}

export type StatusRuleFunction = (code: number) => boolean

export type StatusRule = StatusRuleSet | StatusRuleFunction

export type ExtendedBase<
  Base extends string,
  Extended extends Partial<GlobalOptions>,
> = Extended extends { base: infer ChildBase extends string }
  ? ChildBase extends ''
    ? Base
    : Join<Base, ChildBase>
  : Base

export type DeepExact<Expected, Actual> = [Expected] extends [
  | string
  | number
  | boolean
  | symbol
  | null
  | undefined
  /* biome-ignore lint/suspicious/noExplicitAny: 汎用的な関数型判定のため */
  | ((...parameters: any[]) => any)
  /* biome-ignore lint/suspicious/noExplicitAny: 汎用的な型判定のため */
  | any[],
]
  ? Actual
  : string extends keyof NonNullable<Expected>
    ? Actual
    : /* biome-ignore lint/suspicious/noExplicitAny: 関数を含むユニオン型の判定のため */
      ((...parameters: any[]) => any) extends NonNullable<Expected>
      ? Actual
      : Actual &
          Record<Exclude<keyof Actual, keyof NonNullable<Expected>>, never> & {
            [Key in keyof Actual & keyof NonNullable<Expected>]: DeepExact<
              NonNullable<Expected>[Key],
              Actual[Key]
            >
          }

type Origin<Value extends string> = Value extends `${infer Protocol}://${infer Host}/${infer _$}`
  ? `${Protocol}://${Host}`
  : Value extends `${infer Protocol}://${infer Host}`
    ? `${Protocol}://${Host}`
    : never

type HasStartSlash<Value extends string> = Value extends `/${infer _$}` ? true : false

type HasProtocol<Value extends string> = Value extends `http://${infer _$}`
  ? true
  : Value extends `https://${infer _$}`
    ? true
    : false

type TrimEndSlash<Value extends string> = Value extends `${infer Segment}/`
  ? TrimEndSlash<Segment>
  : Value

type TrimStartSlash<Value extends string> = Value extends `/${infer Segment}` ? Segment : Value

export type Join<Parent extends string, Child extends string> = Child extends ''
  ? Parent
  : HasProtocol<Child> extends true
    ? Child
    : HasStartSlash<Child> extends true
      ? HasProtocol<Parent> extends true
        ? Origin<Parent> extends infer ParentOrigin
          ? ParentOrigin extends string
            ? `${ParentOrigin}${Child}`
            : never
          : never
        : Child
      : Parent extends ''
        ? Child
        : `${TrimEndSlash<Parent>}/${TrimStartSlash<Child>}`
