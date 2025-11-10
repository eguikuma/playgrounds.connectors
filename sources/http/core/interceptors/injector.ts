import type { RequestInterceptor } from '../models'

type InjectorOptions = {
  headers: () => Record<string, string> | Promise<Record<string, string>>
}

export const injector = (options: InjectorOptions): RequestInterceptor => {
  return async (context) => {
    return {
      ...context,
      options: {
        ...context.options,
        headers: {
          ...context.options.headers,
          ...(await options.headers()),
        },
      },
    }
  }
}
