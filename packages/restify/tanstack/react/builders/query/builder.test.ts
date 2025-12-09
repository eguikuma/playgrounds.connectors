import { createElement } from 'react'
import type { ReactNode } from 'react'

import { renderHook, waitFor } from '@testing-library/react'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { instance, type Outcome, type Outcomer } from '@outcomify/requestify'

import { createQuery } from './builder'

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

  describe('createQuery', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      const data = { id: 1, name: 'Got' }
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const execute = createQuery(outcomer)

      const { result } = renderHook(() => execute('/api/me', { key: ['get-string'] }), {
        wrapper,
      })

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success?.data).toEqual(data)
      expect(result.current.states.failed).toBe(false)
    })

    test('サーバーアクションを指定して、成功結果を取得すること', async () => {
      const data = { id: 1, name: 'Got' }
      const execute = createQuery(outcomer)
      const action = async (): Promise<Outcome<typeof data>> => ({
        success: true,
        status: StatusCodes.OK,
        data,
      })

      const { result } = renderHook(() => execute(action, { key: ['get-action'] }), { wrapper })

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success?.data).toEqual(data)
      expect(result.current.states.failed).toBe(false)
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      const execute = createQuery(outcomer)
      const action = async (): Promise<Outcome<unknown>> => ({
        success: false,
        status: StatusCodes.BAD_REQUEST,
        message: getReasonPhrase(StatusCodes.BAD_REQUEST),
      })

      const { result } = renderHook(() => execute(action, { key: ['get-4xx'] }), { wrapper })

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toBeUndefined()
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      const execute = createQuery(outcomer)
      const action = async () => {
        throw new Response(null, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }

      const { result } = renderHook(() => execute(action, { key: ['get-5xx'] }), { wrapper })

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toBeUndefined()
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const execute = createQuery(outcomer)
      const action = async () => {
        throw new Error('The query action was aborted')
      }

      const { result } = renderHook(() => execute(action, { key: ['get-thrown'] }), { wrapper })

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toBeUndefined()
    })
  })
})
