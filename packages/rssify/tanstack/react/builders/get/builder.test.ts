import { createElement } from 'react'
import type { ReactNode } from 'react'

import { renderHook, waitFor } from '@testing-library/react'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import type { Outcome } from '@outcomify/requestify'
import { create as http } from '@outcomify/restify-tanstack/react'
import { create as rss } from '@outcomify/rssify'

import { createQuery } from './builder'

describe('builder.ts', () => {
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

  describe('createQuery', () => {
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
      const execute = createQuery(rss(), http())

      const { result } = renderHook(() => execute('/api/feed.xml', { key: ['rss-get-string'] }), {
        wrapper,
      })

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success?.data.title).toBe('String Feed')
      expect(result.current.responses.success?.data.entries).toHaveLength(2)
      expect(result.current.states.failed).toBe(false)
    })

    test('サーバーアクションを指定して、成功結果を取得すること', async () => {
      const execute = createQuery(rss(), http())
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

      const { result } = renderHook(() => execute(action, { key: ['rss-get-action'] }), { wrapper })

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success?.data.title).toBe('Server Action Feed')
      expect(result.current.responses.success?.data.entries).toHaveLength(2)
      expect(result.current.states.failed).toBe(false)
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      const execute = createQuery(rss(), http())
      const action = async (): Promise<Outcome<string>> => ({
        success: false,
        status: StatusCodes.BAD_REQUEST,
        message: getReasonPhrase(StatusCodes.BAD_REQUEST),
      })

      const { result } = renderHook(() => execute(action, { key: ['rss-get-4xx'] }), { wrapper })

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toBeUndefined()
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      const execute = createQuery(rss(), http())
      const action = async (): Promise<Outcome<string>> => ({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      })

      const { result } = renderHook(() => execute(action, { key: ['rss-get-5xx'] }), { wrapper })

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toBeUndefined()
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const execute = createQuery(rss(), http())
      const action = async () => {
        throw new Error('The get action was aborted')
      }

      const { result } = renderHook(() => execute(action, { key: ['rss-get-thrown'] }), { wrapper })

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toBeUndefined()
    })
  })
})
