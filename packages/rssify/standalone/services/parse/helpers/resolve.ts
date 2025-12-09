import type { RawEntry } from '../models/raw'

export const attempt = <Converted>(
  entry: RawEntry,
  strategies: ((entry: RawEntry) => Converted | undefined)[],
): Converted | undefined => {
  for (const strategy of strategies) {
    const result = strategy(entry)

    if (result !== undefined) return result
  }

  return undefined
}
