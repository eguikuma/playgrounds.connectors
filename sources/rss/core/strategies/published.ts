import type { RawEntry } from '../models'

export const fromIso = (entry: RawEntry): Date | undefined => {
  if (entry.isoDate) {
    const trimmed = entry.isoDate.trim()

    if (!trimmed) {
      return undefined
    }

    const parsed = new Date(trimmed)

    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }

  return undefined
}

export const fromPub = (entry: RawEntry): Date | undefined => {
  if (entry.pubDate) {
    const trimmed = entry.pubDate.trim()

    if (!trimmed) {
      return undefined
    }

    const parsed = new Date(trimmed)

    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }

  return undefined
}
