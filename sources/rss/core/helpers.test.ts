import { describe, test, expect } from 'vitest'

import { thumbnail, description, date, normalize } from './helpers'
import type { RawEntry } from './models'

describe('helpers.ts', () => {
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

      expect(thumbnail(entry)).toBe('https://example.com/enclosure.jpg')
    })

    test('優先度2のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        itunesImage: 'https://example.com/itunes.jpg',
        mediaThumbnail: 'https://example.com/media.jpg',
        image: 'https://example.com/image.jpg',
        content: '<img src="https://example.com/content.jpg"/>',
        summary: '<img src="https://example.com/summary.jpg"/>',
      }

      expect(thumbnail(entry)).toBe('https://example.com/itunes.jpg')
    })

    test('優先度3のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        mediaThumbnail: 'https://example.com/media.jpg',
        image: 'https://example.com/image.jpg',
        content: '<img src="https://example.com/content.jpg"/>',
        summary: '<img src="https://example.com/summary.jpg"/>',
      }

      expect(thumbnail(entry)).toBe('https://example.com/media.jpg')
    })

    test('優先度4のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        image: 'https://example.com/image.jpg',
        content: '<img src="https://example.com/content.jpg"/>',
        summary: '<img src="https://example.com/summary.jpg"/>',
      }

      expect(thumbnail(entry)).toBe('https://example.com/image.jpg')
    })

    test('優先度5のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        content: '<img src="https://example.com/content.jpg"/>',
        summary: '<img src="https://example.com/summary.jpg"/>',
      }

      expect(thumbnail(entry)).toBe('https://example.com/content.jpg')
    })

    test('優先度6のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        summary: '<img src="https://example.com/summary.jpg"/>',
      }

      expect(thumbnail(entry)).toBe('https://example.com/summary.jpg')
    })

    test('サムネイルがない場合、undefinedを返すこと', () => {
      const entry: RawEntry = {}

      expect(thumbnail(entry)).toBeUndefined()
    })
  })

  describe('description', () => {
    test('優先度1の説明を取得すること', () => {
      const entry: RawEntry = {
        contentSnippet: 'Priority snippet',
        summary: 'Summary text',
        content: '<p>Content text</p>',
      }

      expect(description(entry)).toBe('Priority snippet')
    })

    test('優先度2の説明を取得すること', () => {
      const entry: RawEntry = {
        summary: 'Summary text',
        content: '<p>Content text</p>',
      }

      expect(description(entry)).toBe('Summary text')
    })

    test('優先度3の説明を取得すること', () => {
      const entry: RawEntry = {
        content: '<p>Content text</p>',
      }

      expect(description(entry)).toBe('Content text')
    })

    test('説明がない場合、undefinedを返すこと', () => {
      const entry: RawEntry = {}

      expect(description(entry)).toBeUndefined()
    })
  })

  describe('date', () => {
    test('優先度1の日付を取得すること', () => {
      const entry: RawEntry = {
        isoDate: '2024-01-01T00:00:00.000Z',
        pubDate: 'Mon, 31 Dec 2023 00:00:00 GMT',
      }

      expect(date(entry)?.toISOString()).toBe('2024-01-01T00:00:00.000Z')
    })

    test('優先度2の日付を取得すること', () => {
      const entry: RawEntry = {
        pubDate: 'Mon, 01 Jan 2024 00:00:00 GMT',
      }

      expect(date(entry)).toBeInstanceOf(Date)
    })

    test('日付がない場合、undefinedを返すこと', () => {
      const entry: RawEntry = {}

      expect(date(entry)).toBeUndefined()
    })
  })

  describe('normalize', () => {
    test('完全なエントリーを正規化すること', () => {
      const entry: RawEntry = {
        guid: 'raw-entry-123',
        title: 'Raw Entry',
        contentSnippet: 'Raw description',
        link: 'https://example.com/entry',
        enclosure: { url: 'https://example.com/normalize.jpg', length: 12345, type: 'image/jpeg' },
        isoDate: '2024-01-01T00:00:00.000Z',
        creator: 'Raw Author',
        categories: ['Tech', 'News'],
      }

      expect(normalize(entry)).toEqual({
        identifier: 'raw-entry-123',
        title: 'Raw Entry',
        description: 'Raw description',
        link: 'https://example.com/entry',
        thumbnail: 'https://example.com/normalize.jpg',
        published: new Date('2024-01-01T00:00:00.000Z'),
        creator: 'Raw Author',
        categories: ['Tech', 'News'],
        snippet: 'Raw description',
      })
    })

    test('部分的なエントリーを正規化すること', () => {
      const entry: RawEntry = {
        title: 'Minimal Entry',
      }

      expect(normalize(entry)).toEqual({
        identifier: undefined,
        title: 'Minimal Entry',
        description: undefined,
        link: undefined,
        thumbnail: undefined,
        published: undefined,
        creator: undefined,
        categories: undefined,
        snippet: undefined,
      })
    })

    test('空のエントリーを正規化すること', () => {
      const entry: RawEntry = {}

      expect(normalize(entry)).toEqual({
        identifier: undefined,
        title: undefined,
        description: undefined,
        link: undefined,
        thumbnail: undefined,
        published: undefined,
        creator: undefined,
        categories: undefined,
        snippet: undefined,
      })
    })
  })
})
