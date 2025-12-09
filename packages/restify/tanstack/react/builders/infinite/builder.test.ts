import { createElement } from 'react'
import type { ReactNode } from 'react'

import { renderHook, waitFor } from '@testing-library/react'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { instance, type Outcome, type Outcomer } from '@outcomify/requestify'

import { createInfiniteQuery } from './builder'

describe('builder.ts', () => {
  let outcomer: Outcomer
  let tanstack: QueryClient
  let wrapper: ({ children }: { children: ReactNode }) => ReactNode

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    outcomer = instance()
    tanstack = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: tanstack }, children)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('createInfiniteQuery', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      let id = 0
      globalThis.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(Array.from({ length: 10 }, () => ({ id: ++id }))), {
            status: StatusCodes.OK,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
      )
      const execute = createInfiniteQuery(outcomer)

      const { result } = renderHook(
        () =>
          execute('/api/data', {
            key: ['infinite-string'],
            next: ({ variables }) =>
              variables.page < 2 ? { page: variables.page + 1 } : undefined,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success).toHaveLength(1)
      expect(result.current.responses.success[0]?.data).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        { id: 9 },
        { id: 10 },
      ])
      result.current.handlers.next()
      await waitFor(() => expect(result.current.responses.success).toHaveLength(2))
      expect(result.current.responses.success[1]?.data).toEqual([
        { id: 11 },
        { id: 12 },
        { id: 13 },
        { id: 14 },
        { id: 15 },
        { id: 16 },
        { id: 17 },
        { id: 18 },
        { id: 19 },
        { id: 20 },
      ])
      expect(result.current.states.failed).toBe(false)
    })

    test('サーバーアクションを指定して、成功結果を取得すること', async () => {
      const execute = createInfiniteQuery(outcomer)
      const action = async ({ page }: { page: number }): Promise<Outcome<{ id: number }[]>> => ({
        success: true,
        status: StatusCodes.OK,
        data: Array.from({ length: 9 }, (_, index) => ({
          id: index + 1 + page * 9,
        })),
      })

      const { result } = renderHook(
        () =>
          execute(action, {
            key: ['infinite-action'],
            next: ({ variables }) =>
              variables.page < 2 ? { page: variables.page + 1 } : undefined,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success).toHaveLength(1)
      expect(result.current.responses.success[0]?.data).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        { id: 9 },
      ])
      result.current.handlers.next()
      await waitFor(() => expect(result.current.responses.success).toHaveLength(2))
      expect(result.current.responses.success[1]?.data).toEqual([
        { id: 10 },
        { id: 11 },
        { id: 12 },
        { id: 13 },
        { id: 14 },
        { id: 15 },
        { id: 16 },
        { id: 17 },
        { id: 18 },
      ])
      expect(result.current.states.failed).toBe(false)
    })

    test('テンプレート関数を指定して、成功結果を取得すること', async () => {
      let id = 0
      globalThis.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(Array.from({ length: 8 }, () => ({ id: ++id }))), {
            status: StatusCodes.OK,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
      )
      const execute = createInfiniteQuery(outcomer)
      const template = ({ page }: { page: number }) => `/api/data?page=${page}`

      const { result } = renderHook(
        () =>
          execute(template, {
            key: ['infinite-template'],
            next: ({ variables }) =>
              variables.page < 2 ? { page: variables.page + 1 } : undefined,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success).toHaveLength(1)
      expect(result.current.responses.success[0]?.data).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
      ])
      result.current.handlers.next()
      await waitFor(() => expect(result.current.responses.success).toHaveLength(2))
      expect(result.current.responses.success[1]?.data).toEqual([
        { id: 9 },
        { id: 10 },
        { id: 11 },
        { id: 12 },
        { id: 13 },
        { id: 14 },
        { id: 15 },
        { id: 16 },
      ])
      expect(result.current.states.failed).toBe(false)
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      const execute = createInfiniteQuery(outcomer)
      const action = async (_: { page: number }): Promise<Outcome<unknown>> => ({
        success: false,
        status: StatusCodes.BAD_REQUEST,
        message: getReasonPhrase(StatusCodes.BAD_REQUEST),
      })

      const { result } = renderHook(
        () =>
          execute(action, {
            key: ['infinite-4xx'],
            next: () => undefined,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toEqual([])
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      const execute = createInfiniteQuery(outcomer)
      const action = async (_: { page: number }) => {
        throw new Response(null, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }

      const { result } = renderHook(
        () =>
          execute(action, {
            key: ['infinite-5xx'],
            next: () => undefined,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toEqual([])
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const execute = createInfiniteQuery(outcomer)
      const action = async (_: { page: number }) => {
        throw new Error('The infinite action was aborted')
      }

      const { result } = renderHook(
        () =>
          execute(action, {
            key: ['infinite-thrown'],
            next: () => undefined,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toEqual([])
    })
  })
})
