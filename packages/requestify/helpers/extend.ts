import { asThis } from './guard'
import { headerify } from './normalize'
import type { GlobalOptions } from '../models/options'

export const mixin = <Options extends Partial<GlobalOptions>>(
  options: Options | undefined,
  defaults: Partial<GlobalOptions>,
): Options =>
  asThis<Options>({
    ...defaults,
    ...options,
    headers: {
      ...headerify(defaults.headers),
      ...headerify(options?.headers),
    },
  })

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
