import { isString } from '@outcomify/requestify'

import type { RawEntry } from '../models/raw'

export const fromIso = (entry: RawEntry): Date | undefined => {
  if (entry.isoDate && isString(entry.isoDate)) {
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
  if (entry.pubDate && isString(entry.pubDate)) {
    const trimmed = entry.pubDate.trim()

    if (!trimmed) {
      return undefined
    }

    const parsed = new Date(trimmed)

    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }

  return undefined
}
