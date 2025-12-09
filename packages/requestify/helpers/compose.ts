import { asThis } from './guard'

/* biome-ignore lint/suspicious/noExplicitAny: 汎用的な関数型のため */
export const chain = <Handler extends (...parameters: any[]) => void>(
  parent?: Handler,
  child?: Handler,
): Handler | undefined => {
  if (parent && child) {
    return asThis<Handler>((...parameters: Parameters<Handler>) => {
      parent(...parameters)
      child(...parameters)
    })
  }

  return parent || child
}
