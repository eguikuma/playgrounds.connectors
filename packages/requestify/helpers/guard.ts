export const asThis = <Expected>(value: unknown): Expected => value as Expected

export const isThis = <Expected>(value: unknown): value is Expected =>
  value !== undefined && value !== null

/* biome-ignore lint/suspicious/noExplicitAny: 汎用的な関数型判定のため */
export const isFunction = (value: unknown): value is (...parameters: any[]) => any =>
  typeof value === 'function'

export const isResponse = (value: unknown): value is Response => value instanceof Response

export const isString = (value: unknown): value is string => typeof value === 'string'

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

export const isCancelled = (thrown: unknown): boolean =>
  thrown instanceof Error && (thrown.name === 'AbortError' || thrown.name === 'TimeoutError')

export const has =
  <Expected extends Record<string, unknown>>(key: keyof Expected & string) =>
  (value: unknown): value is Expected =>
    value !== null && typeof value === 'object' && key in value
