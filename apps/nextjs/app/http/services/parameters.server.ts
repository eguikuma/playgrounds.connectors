import { createSearchParamsCache, parseAsInteger } from 'nuqs/server'

export const page = parseAsInteger.withDefault(1).withOptions({ clearOnDefault: false })

export const queries = createSearchParamsCache({
  page,
})
