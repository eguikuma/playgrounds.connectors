import type { RawEntry, Entry } from './models'
import * as Description from './strategies/description'
import * as Published from './strategies/published'
import * as Thumbnail from './strategies/thumbnail'

const attempt = <Converted>(
  entry: RawEntry,
  strategies: ((entry: RawEntry) => Converted | undefined)[],
): Converted | undefined => {
  for (const strategy of strategies) {
    const result = strategy(entry)

    if (result !== undefined) return result
  }

  return undefined
}

export const thumbnail = (entry: RawEntry): string | undefined =>
  attempt(entry, [
    Thumbnail.fromEnclosure,
    Thumbnail.fromItunes,
    Thumbnail.fromMedia,
    Thumbnail.fromCustom,
    Thumbnail.fromContent,
    Thumbnail.fromSummary,
  ])

export const description = (entry: RawEntry): string | undefined =>
  attempt(entry, [Description.fromSnippet, Description.fromSummary, Description.fromContent])

export const date = (entry: RawEntry): Date | undefined =>
  attempt(entry, [Published.fromIso, Published.fromPub])

export const normalize = (entry: RawEntry): Entry => ({
  identifier: entry.guid,
  title: entry.title,
  description: description(entry),
  link: entry.link,
  thumbnail: thumbnail(entry),
  published: date(entry),
  creator: entry.creator,
  categories: entry.categories,
  snippet: entry.contentSnippet,
})
