import Parser from 'rss-parser'

import { ParseError } from './helpers/exception'
import { attempt } from './helpers/resolve'
import type { Entry, Feed } from './models/parsed'
import type { Fields, RawEntry } from './models/raw'
import * as Description from './strategies/description'
import * as Published from './strategies/published'
import * as Thumbnail from './strategies/thumbnail'

export class FeedParser {
  private readonly parser: Parser<Fields>

  constructor() {
    this.parser = new Parser<Fields>({
      customFields: {
        item: [
          ['media:thumbnail', 'mediaThumbnail'],
          ['media:content', 'mediaContent'],
          ['media:group', 'mediaGroup'],
          ['itunes:image', 'itunesImage'],
          ['image', 'image'],
          ['thumbnail', 'thumbnail'],
        ],
      },
    })
  }

  async parse(markup: string): Promise<Feed> {
    try {
      const raw = await this.parser.parseString(markup)

      return {
        title: raw.title,
        link: raw.link,
        description: raw.description,
        entries:
          raw.items?.map(
            (entry: RawEntry): Entry => ({
              identifier: entry.guid,
              title: entry.title,
              description: this.description(entry),
              link: entry.link,
              thumbnail: this.thumbnail(entry),
              published: this.date(entry),
              creator: entry.creator,
              categories: entry.categories,
              snippet: entry.contentSnippet,
            }),
          ) ?? [],
      }
    } catch (thrown) {
      throw new ParseError(thrown)
    }
  }

  description(entry: RawEntry): string | undefined {
    return attempt(entry, [
      Description.fromSnippet,
      Description.fromSummary,
      Description.fromContent,
    ])
  }

  thumbnail(entry: RawEntry): string | undefined {
    return attempt(entry, [
      Thumbnail.fromEnclosure,
      Thumbnail.fromItunes,
      Thumbnail.fromMedia,
      Thumbnail.fromCustom,
      Thumbnail.fromContent,
      Thumbnail.fromSummary,
    ])
  }

  date(entry: RawEntry): Date | undefined {
    return attempt(entry, [Published.fromIso, Published.fromPub])
  }
}
