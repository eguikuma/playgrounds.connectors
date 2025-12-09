import { asThis, isFunction } from '@outcomify/requestify'

const store = new Map<string, number>()

export const timestamps = {
  mark: (key: unknown[]): void => {
    store.set(JSON.stringify(key), Date.now())
  },
  find: (
    key: unknown[],
  ): {
    timestamp: number
    matched: string | undefined
  } => {
    for (const [stored, timestamp] of store) {
      let parsed: unknown

      try {
        parsed = JSON.parse(stored)
      } catch {
        continue
      }

      if (!Array.isArray(parsed)) {
        continue
      }

      if (parsed.length === 0 || parsed.length > key.length) {
        continue
      }

      const matched = parsed.every(
        (element, index) => JSON.stringify(element) === JSON.stringify(key[index]),
      )

      if (matched) {
        return { timestamp, matched: stored }
      }
    }

    return { timestamp: 0, matched: undefined }
  },
  remove: (key: string): void => {
    store.delete(key)
  },
  clear: (): void => {
    store.clear()
  },
}

export const staleness =
  <Query extends { state: { dataUpdatedAt: number } }>(
    key: unknown[],
    stale: number | ((query: Query) => number) | undefined,
  ) =>
  (query: { state: { dataUpdatedAt: number } }): number => {
    const found = timestamps.find(key)

    if (found.timestamp > 0) {
      if (found.timestamp > query.state.dataUpdatedAt) {
        return 0
      }

      if (found.matched && found.matched === JSON.stringify(key)) {
        timestamps.remove(found.matched)
      }
    }

    return isFunction(stale) ? stale(asThis<Query>(query)) : (stale ?? 0)
  }
