import { StatusCodes } from 'http-status-codes'
import { describe, test, expect, vi, beforeEach } from 'vitest'

import { factory } from './factory'
import type { Outcome } from '../../http/core/models'

const mock = {
  get: vi.fn(),
}

vi.mock('../../http/vanilla/factory', () => ({
  factory: () => mock,
}))

describe('factory.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('get', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      mock.get.mockResolvedValueOnce({
        success: true,
        status: StatusCodes.OK,
        data: `
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
                <media:thumbnail url="https://example.com/thumb.jpg" />
              </item>
            </channel>
          </rss>
        `,
      })
      const rss = factory()

      const response = await rss.get('https://example.com/feed.xml')

      expect(response.success).toBe(true)
      if (response.success) {
        expect(response.data.entries).toHaveLength(1)
        expect(response.data.entries[0]?.title).toBe('First Post')
        expect(response.data.entries[0]?.link).toBe('https://example.com/first')
        expect(response.data.entries[0]?.thumbnail).toBe('https://example.com/thumb.jpg')
      }
      expect(mock.get).toHaveBeenCalled()
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
      const rss = factory()

      const response = await rss.get(action)

      expect(response.success).toBe(true)
      if (response.success) {
        expect(response.data.entries).toHaveLength(2)
        expect(response.data.entries[0]?.title).toBe('Function Entry 1')
        expect(response.data.entries[1]?.title).toBe('Function Entry 2')
        expect(response.data.entries[2]).toBeUndefined()
      }
      expect(action).toHaveBeenCalled()
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      mock.get.mockResolvedValueOnce({
        success: true,
        status: StatusCodes.OK,
        data: 'invalid xml content',
      })
      const rss = factory()

      const response = await rss.get('https://example.com/invalid.xml')

      expect(response.success).toBe(false)
      if (!response.success) {
        expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
      }
    })
  })
})
