import Parser from 'rss-parser'

import { ParseError } from './errors'
import { normalize } from './helpers'
import type { RawEntry, Feed, Fields } from './models'

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
        entries: raw.items?.map((item: RawEntry) => normalize(item)) ?? [],
      }
    } catch (thrown) {
      throw new ParseError(thrown)
    }
  }
}
