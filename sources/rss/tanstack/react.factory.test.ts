import { createElement } from 'react'
import type { ReactNode } from 'react'

import { renderHook, waitFor } from '@testing-library/react'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { factory } from './react.factory'
import type { Outcome } from '../../http/core/models'
import type { Feed, Entry, PagedFeed } from '../core/models'

describe('react.factory.ts', () => {
  let tanstack: QueryClient
  let wrapper: ({ children }: { children: ReactNode }) => ReactNode

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())

    tanstack = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: tanstack }, children)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('get', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(
          `
            <?xml version="1.0" encoding="UTF-8"?>
            <rss version="2.0">
              <channel>
                <title>String Feed</title>
                <item><title>Entry 1</title><guid>entry-1</guid></item>
                <item><title>Entry 2</title><guid>entry-2</guid></item>
              </channel>
            </rss>
          `,
          {
            status: StatusCodes.OK,
            headers: { 'Content-Type': 'application/xml' },
          },
        ),
      )
      const rss = factory()

      const { result } = renderHook(() => rss.get('/api/feed.xml', { key: ['rss-get-string'] }), {
        wrapper,
      })

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success?.data.title).toBe('String Feed')
      expect(result.current.responses.success?.data.entries).toHaveLength(2)
      expect(result.current.states.failed).toBe(false)
    })

    test('サーバーアクションを指定して、成功結果を取得すること', async () => {
      const rss = factory()
      const action = async (): Promise<Outcome<string>> => ({
        success: true,
        status: StatusCodes.OK,
        data: `
          <?xml version="1.0" encoding="UTF-8"?>
          <rss version="2.0">
            <channel>
              <title>Server Action Feed</title>
              <item><title>Entry 1</title><guid>entry-1</guid></item>
              <item><title>Entry 2</title><guid>entry-2</guid></item>
            </channel>
          </rss>
        `,
      })

      const { result } = renderHook(() => rss.get(action, { key: ['rss-get-action'] }), { wrapper })

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success?.data.title).toBe('Server Action Feed')
      expect(result.current.responses.success?.data.entries).toHaveLength(2)
      expect(result.current.states.failed).toBe(false)
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      const rss = factory()
      const action = async (): Promise<Outcome<string>> => ({
        success: false,
        status: StatusCodes.BAD_REQUEST,
        message: getReasonPhrase(StatusCodes.BAD_REQUEST),
      })

      const { result } = renderHook(() => rss.get(action, { key: ['rss-get-4xx'] }), { wrapper })

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toBeUndefined()
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      const rss = factory()
      const action = async (): Promise<Outcome<string>> => ({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      })

      const { result } = renderHook(() => rss.get(action, { key: ['rss-get-5xx'] }), { wrapper })

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toBeUndefined()
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const rss = factory()
      const action = async () => {
        throw new Error('The get action was aborted')
      }

      const { result } = renderHook(() => rss.get(action, { key: ['rss-get-thrown'] }), { wrapper })

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toBeUndefined()
    })
  })

  describe('infinite', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(
          `
            <?xml version="1.0" encoding="UTF-8"?>
            <rss version="2.0">
              <channel>
                <title>String Feed</title>
                ${Array.from({ length: 10 }, (_, index) => `<item><title>Entry ${index}</title><guid>entry-${index}</guid></item>`).join('\n    ')}
              </channel>
            </rss>
          `,
          {
            status: StatusCodes.OK,
            headers: { 'Content-Type': 'application/xml' },
          },
        ),
      )
      const rss = factory()

      const { result } = renderHook(
        () =>
          rss.infinite('/api/feed.xml', {
            key: ['rss-infinite-string'],
            size: 3,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success).toHaveLength(1)
      expect(result.current.responses.success[0]?.data.entries).toHaveLength(3)
      expect(result.current.states.failed).toBe(false)
    })

    test('サーバーアクションを指定して、成功結果を取得すること', async () => {
      const entries: Entry[] = Array.from({ length: 10 }, (_, index) => ({
        identifier: `entry-${index}`,
        title: `Entry ${index}`,
      }))
      const feed: Feed = {
        title: 'Test Feed',
        entries,
      }
      const rss = factory()
      const action = async (): Promise<Outcome<typeof feed>> => ({
        success: true,
        status: StatusCodes.OK,
        data: feed,
      })

      const { result } = renderHook(
        () =>
          rss.infinite(action, {
            key: ['rss-infinite-action'],
            size: 3,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success).toHaveLength(1)
      expect(result.current.states.failed).toBe(false)
    })

    test('テンプレート関数を指定して、成功結果を取得すること', async () => {
      globalThis.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(
            `
              <?xml version="1.0" encoding="UTF-8"?>
              <rss version="2.0">
                <channel>
                  <title>Template Function Feed</title>
                  ${Array.from({ length: 10 }, (_, index) => `<item><title>Template Entry ${index}</title><guid>template-entry-${index}</guid></item>`).join('\n    ')}
                </channel>
              </rss>
            `,
            {
              status: StatusCodes.OK,
              headers: { 'Content-Type': 'application/xml' },
            },
          ),
        ),
      )
      const rss = factory()
      const template = ({ page }: { page: number }) => `https://example.com/feed?page=${page}`

      const { result } = renderHook(
        () =>
          rss.infinite(template, {
            key: ['rss-infinite-template'],
            size: 3,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.responses.success).toHaveLength(1)
      expect(result.current.responses.success[0]?.data.entries).toHaveLength(3)
    })

    test('指定されたサイズ分のエントリーをスライスして返すこと', async () => {
      const entries: Entry[] = Array.from({ length: 10 }, (_, index) => ({
        identifier: `entry-${index}`,
        title: `Entry ${index}`,
        description: `Description ${index}`,
      }))
      const feed: Feed = {
        title: 'Slice Feed',
        description: 'Slice Feed Description',
        entries,
      }
      const rss = factory()
      const action = async (): Promise<Outcome<typeof feed>> => ({
        success: true,
        status: StatusCodes.OK,
        data: feed,
      })

      const { result } = renderHook(
        () =>
          rss.infinite(action, {
            key: ['rss-infinite-slice'],
            size: 3,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success).toHaveLength(1)
      const page = result.current.responses.success[0]?.data as PagedFeed
      expect(page.entries).toHaveLength(3)
      expect((page.entries[0] as Entry).identifier).toBe('entry-0')
      expect((page.entries[1] as Entry).identifier).toBe('entry-1')
      expect((page.entries[2] as Entry).identifier).toBe('entry-2')
    })

    test('最後のページの場合、ページ取得の関数は呼び出されないこと', async () => {
      const entries: Entry[] = Array.from({ length: 5 }, (_, index) => ({
        identifier: `entry-${index}`,
        title: `Entry ${index}`,
      }))
      const feed: Feed = {
        title: 'Last Page Feed',
        entries,
      }
      const rss = factory()
      const action = async (): Promise<Outcome<typeof feed>> => ({
        success: true,
        status: StatusCodes.OK,
        data: feed,
      })

      const { result } = renderHook(
        () =>
          rss.infinite(action, {
            key: ['rss-infinite-last-page'],
            size: 3,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.success).toBe(true))
      const page1 = result.current.responses.success[0]?.data as PagedFeed
      expect(page1.next).toBe(1)
      result.current.handlers.next()
      await waitFor(() => expect(result.current.responses.success).toHaveLength(2))
      const page2 = result.current.responses.success[1]?.data as PagedFeed
      expect(page2.entries).toHaveLength(2)
      expect(page2.next).toBeUndefined()
    })

    test('デフォルト値を変換すること', async () => {
      const entries: Entry[] = Array.from({ length: 10 }, (_, index) => ({
        identifier: `entry-${index}`,
        title: `Entry ${index}`,
      }))
      const defaults: Feed = {
        title: 'Default Feed',
        entries,
      }
      const rss = factory()
      const action = async (): Promise<Outcome<typeof defaults>> => ({
        success: true,
        status: StatusCodes.OK,
        data: defaults,
      })

      const { result } = renderHook(
        () =>
          rss.infinite(action, {
            key: ['rss-infinite-defaults'],
            size: 4,
            defaults,
          }),
        { wrapper },
      )

      expect(result.current.responses.success).toHaveLength(1)
      const page = result.current.responses.success[0]?.data as PagedFeed
      expect(page.entries).toHaveLength(4)
      expect((page.entries[0] as Entry).identifier).toBe('entry-0')
      expect((page.entries[3] as Entry).identifier).toBe('entry-3')
      expect(page.total).toBe(10)
      expect(page.next).toBe(1)
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      const rss = factory()
      const action = async (): Promise<Outcome<Feed>> => ({
        success: false,
        status: StatusCodes.BAD_REQUEST,
        message: getReasonPhrase(StatusCodes.BAD_REQUEST),
      })

      const { result } = renderHook(
        () =>
          rss.infinite(action, {
            key: ['rss-infinite-4xx'],
            size: 3,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toEqual([])
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      const rss = factory()
      const action = async (): Promise<Outcome<Feed>> => ({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      })

      const { result } = renderHook(
        () =>
          rss.infinite(action, {
            key: ['rss-infinite-5xx'],
            size: 3,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toEqual([])
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const rss = factory()
      const action = async () => {
        throw new Error('The infinite action was aborted')
      }

      const { result } = renderHook(
        () =>
          rss.infinite(action, {
            key: ['rss-infinite-thrown'],
            size: 3,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toEqual([])
    })
  })
})
