import { describe, test, expect, beforeEach } from 'vitest'

import { ParseError } from './helpers/exception'
import type { RawEntry } from './models/raw'
import { FeedParser } from './parser'

const rss = `
  <?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
    <channel>
      <title>RSS Feed</title>
      <link>https://example.com</link>
      <description>RSS Feed Description</description>
      <item>
        <title>RSS Entry</title>
        <link>https://example.com/rss-entry-1</link>
        <description>RSS Entry Description</description>
        <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
        <media:thumbnail url="https://example.com/rss-thumbnail.jpg" />
      </item>
    </channel>
  </rss>
`

const atom = `
  <?xml version="1.0" encoding="UTF-8"?>
  <feed xmlns="http://www.w3.org/2005/Atom">
    <title>Atom Feed</title>
    <link href="https://example.com"/>
    <updated>2024-01-01T00:00:00Z</updated>
    <entry>
      <title>Atom Entry</title>
      <link href="https://example.com/atom-entry-1"/>
      <updated>2024-01-01T00:00:00Z</updated>
      <media:thumbnail url="https://example.com/atom-thumbnail.jpg" />
    </entry>
  </feed>
`

const xxe = `
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE foo [
    <!ENTITY xxe SYSTEM "file:///etc/passwd">
  ]>
  <rss version="2.0">
    <channel>
      <title>&xxe;</title>
      <link>https://example.com</link>
      <description>XXE</description>
    </channel>
  </rss>
`

describe('parser.ts', () => {
  let parser: FeedParser

  beforeEach(() => {
    parser = new FeedParser()
  })

  describe('description', () => {
    test('優先度1の説明を取得すること', () => {
      const entry: RawEntry = {
        contentSnippet: 'Priority snippet',
        summary: 'Summary text',
        content: '<p>Content text</p>',
      }

      expect(parser.description(entry)).toBe('Priority snippet')
    })

    test('優先度2の説明を取得すること', () => {
      const entry: RawEntry = {
        summary: 'Summary text',
        content: '<p>Content text</p>',
      }

      expect(parser.description(entry)).toBe('Summary text')
    })

    test('優先度3の説明を取得すること', () => {
      const entry: RawEntry = {
        content: '<p>Content text</p>',
      }

      expect(parser.description(entry)).toBe('Content text')
    })

    test('説明がない場合、undefinedを返すこと', () => {
      const entry: RawEntry = {}

      expect(parser.description(entry)).toBeUndefined()
    })
  })

  describe('thumbnail', () => {
    test('優先度1のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        enclosure: { url: 'https://example.com/enclosure.jpg' },
        itunesImage: 'https://example.com/itunes.jpg',
        mediaThumbnail: 'https://example.com/media.jpg',
        image: 'https://example.com/image.jpg',
        content: '<img src="https://example.com/content.jpg"/>',
        summary: '<img src="https://example.com/summary.jpg"/>',
      }

      expect(parser.thumbnail(entry)).toBe('https://example.com/enclosure.jpg')
    })

    test('優先度2のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        itunesImage: 'https://example.com/itunes.jpg',
        mediaThumbnail: 'https://example.com/media.jpg',
        image: 'https://example.com/image.jpg',
        content: '<img src="https://example.com/content.jpg"/>',
        summary: '<img src="https://example.com/summary.jpg"/>',
      }

      expect(parser.thumbnail(entry)).toBe('https://example.com/itunes.jpg')
    })

    test('優先度3のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        mediaThumbnail: 'https://example.com/media.jpg',
        image: 'https://example.com/image.jpg',
        content: '<img src="https://example.com/content.jpg"/>',
        summary: '<img src="https://example.com/summary.jpg"/>',
      }

      expect(parser.thumbnail(entry)).toBe('https://example.com/media.jpg')
    })

    test('優先度4のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        image: 'https://example.com/image.jpg',
        content: '<img src="https://example.com/content.jpg"/>',
        summary: '<img src="https://example.com/summary.jpg"/>',
      }

      expect(parser.thumbnail(entry)).toBe('https://example.com/image.jpg')
    })

    test('優先度5のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        content: '<img src="https://example.com/content.jpg"/>',
        summary: '<img src="https://example.com/summary.jpg"/>',
      }

      expect(parser.thumbnail(entry)).toBe('https://example.com/content.jpg')
    })

    test('優先度6のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        summary: '<img src="https://example.com/summary.jpg"/>',
      }

      expect(parser.thumbnail(entry)).toBe('https://example.com/summary.jpg')
    })

    test('サムネイルがない場合、undefinedを返すこと', () => {
      const entry: RawEntry = {}

      expect(parser.thumbnail(entry)).toBeUndefined()
    })
  })

  describe('date', () => {
    test('優先度1の日付を取得すること', () => {
      const entry: RawEntry = {
        isoDate: '2024-01-01T00:00:00.000Z',
        pubDate: 'Mon, 31 Dec 2023 00:00:00 GMT',
      }

      expect(parser.date(entry)?.toISOString()).toBe('2024-01-01T00:00:00.000Z')
    })

    test('優先度2の日付を取得すること', () => {
      const entry: RawEntry = {
        pubDate: 'Mon, 01 Jan 2024 00:00:00 GMT',
      }

      expect(parser.date(entry)).toBeInstanceOf(Date)
    })

    test('日付がない場合、undefinedを返すこと', () => {
      const entry: RawEntry = {}

      expect(parser.date(entry)).toBeUndefined()
    })
  })

  describe('parse', () => {
    test('RSSフィードを解析すること', async () => {
      const response = await parser.parse(rss)

      expect(response.title).toBe('RSS Feed')
      expect(response.entries).toHaveLength(1)
      expect(response.entries?.[0]?.title).toBe('RSS Entry')
      expect(response.entries?.[0]?.link).toBe('https://example.com/rss-entry-1')
      expect(response.entries?.[0]?.description).toBe('RSS Entry Description')
      expect(response.entries?.[0]?.published?.toISOString()).toBe('2024-01-01T00:00:00.000Z')
      expect(response.entries?.[0]?.thumbnail).toBe('https://example.com/rss-thumbnail.jpg')
    })

    test('Atomフィードを解析すること', async () => {
      const response = await parser.parse(atom)

      expect(response.title).toBe('Atom Feed')
      expect(response.entries).toHaveLength(1)
      expect(response.entries?.[0]?.title).toBe('Atom Entry')
      expect(response.entries?.[0]?.link).toBe('https://example.com/atom-entry-1')
      expect(response.entries?.[0]?.published?.toISOString()).toBe('2024-01-01T00:00:00.000Z')
      expect(response.entries?.[0]?.thumbnail).toBe('https://example.com/atom-thumbnail.jpg')
    })

    test('解析できない場合、エラーとなること', async () => {
      await expect(parser.parse('invalid xml content')).rejects.toThrow(ParseError)
    })

    test('外部エンティティ参照を含むデータの場合、エラーとなること', async () => {
      await expect(parser.parse(xxe)).rejects.toThrow(ParseError)
    })
  })
})
