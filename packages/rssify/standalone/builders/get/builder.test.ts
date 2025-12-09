import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

import type { Outcome } from '@outcomify/requestify'
import { create, type HttpRestStandaloneConnector } from '@outcomify/restify'

import { createGet } from './builder'
import { FeedParser } from '../../services/parse/parser'

describe('builder.ts', () => {
  let http: HttpRestStandaloneConnector
  let parser: FeedParser

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    http = create()
    parser = new FeedParser()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('createGet', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(
          `
            <?xml version="1.0" encoding="UTF-8"?>
            <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
              <channel>
                <title>RSS Feed</title>
                <link>https://example.com</link>
                <description>A RSS feed</description>
                <item>
                  <title>First Post</title>
                  <link>https://example.com/first</link>
                  <guid>https://example.com/first</guid>
                  <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
                  <description>This is the first post</description>
                  <media:thumbnail url="https://example.com/thumbnail.jpg" />
                </item>
              </channel>
            </rss>
          `,
          {
            status: StatusCodes.OK,
            headers: { 'Content-Type': 'application/xml' },
          },
        ),
      )
      const execute = createGet(http, parser)

      const response = await execute('https://example.com/feed.xml')

      expect(response.success).toBe(true)
      if (response.success) {
        expect(response.data.entries).toHaveLength(1)
        expect(response.data.entries[0]?.title).toBe('First Post')
        expect(response.data.entries[0]?.link).toBe('https://example.com/first')
        expect(response.data.entries[0]?.thumbnail).toBe('https://example.com/thumbnail.jpg')
      }
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/feed.xml',
        expect.objectContaining({
          method: 'GET',
        }),
      )
    })

    test('関数を指定して、成功結果を取得すること', async () => {
      const action = vi.fn(
        async (): Promise<Outcome<string>> => ({
          success: true,
          status: StatusCodes.OK,
          data: `
            <?xml version="1.0" encoding="UTF-8"?>
            <rss version="2.0">
              <channel>
                <title>Function Feed</title>
                <item><title>Function Entry 1</title><guid>entry-1</guid></item>
                <item><title>Function Entry 2</title><guid>entry-2</guid></item>
              </channel>
            </rss>
          `,
        }),
      )
      const execute = createGet(http, parser)

      const response = await execute(action)

      expect(response.success).toBe(true)
      if (response.success) {
        expect(response.data.entries).toHaveLength(2)
        expect(response.data.entries[0]?.title).toBe('Function Entry 1')
        expect(response.data.entries[1]?.title).toBe('Function Entry 2')
        expect(response.data.entries[2]).toBeUndefined()
      }
      expect(action).toHaveBeenCalled()
      expect(global.fetch).not.toHaveBeenCalled()
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify({ message: getReasonPhrase(StatusCodes.NOT_FOUND) }), {
          status: StatusCodes.NOT_FOUND,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const execute = createGet(http, parser)

      const response = await execute('https://example.com/not-found.xml')

      expect(response).toEqual({
        success: false,
        status: StatusCodes.NOT_FOUND,
        message: getReasonPhrase(StatusCodes.NOT_FOUND),
      })
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({
            message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
          }),
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      const execute = createGet(http, parser)

      const response = await execute('https://example.com/error.xml')

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      })
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const action = vi.fn(async () => {
        throw new Error('The get operation was aborted')
      })
      const execute = createGet(http, parser)

      const response = await execute(action)

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'The get operation was aborted',
      })
    })

    test('パースに失敗した場合、失敗結果を返すこと', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response('invalid xml content', {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/xml' },
        }),
      )
      const execute = createGet(http, parser)

      const response = await execute('https://example.com/invalid.xml')

      expect(response.success).toBe(false)
      if (!response.success) {
        expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
      }
    })
  })
})
