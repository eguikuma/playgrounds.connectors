import { describe, test, expect, beforeEach } from 'vitest'

import { ParseError } from './errors'
import { FeedParser } from './parser'

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>RSS Feed</title>
    <link>https://example.com</link>
    <description>A test RSS feed</description>
    <item>
      <title>RSS Entry</title>
      <link>https://example.com/item1</link>
      <description>RSS entry description</description>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
      <media:thumbnail url="https://example.com/thumb.jpg" />
    </item>
  </channel>
</rss>`

const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Feed</title>
  <link href="https://example.com"/>
  <updated>2024-01-01T00:00:00Z</updated>
  <entry>
    <title>Atom Entry</title>
    <link href="https://example.com/entry1"/>
    <updated>2024-01-01T00:00:00Z</updated>
    <summary>Atom entry summary</summary>
  </entry>
</feed>`

describe('parser.ts', () => {
  describe('parse', () => {
    let parser: FeedParser

    beforeEach(() => {
      parser = new FeedParser()
    })

    test('RSSフィードを解析すること', async () => {
      const response = await parser.parse(rss)

      expect(response.title).toBe('RSS Feed')
      expect(response.link).toBe('https://example.com')
      expect(response.description).toBe('A test RSS feed')
      expect(response.entries).toHaveLength(1)
      expect(response.entries?.[0]?.title).toBe('RSS Entry')
      expect(response.entries?.[0]?.link).toBe('https://example.com/item1')
      expect(response.entries?.[0]?.thumbnail).toBe('https://example.com/thumb.jpg')
    })

    test('Atomフィードを解析すること', async () => {
      const response = await parser.parse(atom)

      expect(response.title).toBe('Atom Feed')
      expect(response.entries).toHaveLength(1)
      expect(response.entries?.[0]?.title).toBe('Atom Entry')
    })

    test('解析できない場合、エラーとなること', async () => {
      await expect(parser.parse('invalid xml content')).rejects.toThrow(ParseError)
    })

    test('外部エンティティ参照を含むデータの場合、エラーとなること', async () => {
      const xxe = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<rss version="2.0">
  <channel>
    <title>&xxe;</title>
    <link>https://example.com</link>
    <description>XXE test</description>
  </channel>
</rss>`

      await expect(parser.parse(xxe)).rejects.toThrow(ParseError)
    })
  })
})
