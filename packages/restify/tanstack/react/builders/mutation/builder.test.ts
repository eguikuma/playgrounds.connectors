import { createElement } from 'react'
import type { ReactNode } from 'react'

import { renderHook, waitFor } from '@testing-library/react'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { instance, type Outcome, type Outcomer } from '@outcomify/requestify'

import { createMutation } from './builder'

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

  describe('createMutation', () => {
    test('文字列を指定して、データを作成すること', async () => {
      const data = { id: 1, name: 'Posted' }
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.CREATED,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const execute = createMutation(outcomer, 'POST')

      const { result } = renderHook(() => execute('/api/create', { key: ['post-string'] }), {
        wrapper,
      })
      result.current.handlers.fire(data)

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.responses.success?.data).toEqual(data)
    })

    test('サーバーアクションを指定して、データを作成すること', async () => {
      const data = { id: 1, name: 'Posted' }
      const execute = createMutation(outcomer, 'POST')
      const action = async (): Promise<Outcome<typeof data>> => ({
        success: true,
        status: StatusCodes.CREATED,
        data,
      })

      const { result } = renderHook(() => execute(action, { key: ['post-action'] }), {
        wrapper,
      })
      result.current.handlers.fire(data)

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.responses.success?.data).toEqual(data)
    })

    test('テンプレート関数を指定して、データを作成すること', async () => {
      const data = { id: 1, name: 'Posted' }
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.CREATED,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const execute = createMutation(outcomer, 'POST')
      const template = (variables: typeof data) => `/api/users?name=${variables.name}`

      const { result } = renderHook(() => execute(template, { key: ['post-template'] }), {
        wrapper,
      })
      result.current.handlers.fire(data)

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.responses.success?.data).toEqual(data)
    })

    test('文字列を指定して、データを更新すること', async () => {
      const data = { id: 1, name: 'Put' }
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const execute = createMutation(outcomer, 'PUT')

      const { result } = renderHook(() => execute('/api/update', { key: ['put-string'] }), {
        wrapper,
      })
      result.current.handlers.fire(data)

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.responses.success?.data).toEqual(data)
    })

    test('サーバーアクションを指定して、データを更新すること', async () => {
      const data = { id: 1, name: 'Put' }
      const execute = createMutation(outcomer, 'PUT')
      const action = async (): Promise<Outcome<typeof data>> => ({
        success: true,
        status: StatusCodes.OK,
        data,
      })

      const { result } = renderHook(() => execute(action, { key: ['put-action'] }), { wrapper })
      result.current.handlers.fire(data)

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.responses.success?.data).toEqual(data)
    })

    test('テンプレート関数を指定して、データを更新すること', async () => {
      const data = { id: 1, name: 'Put' }
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const execute = createMutation(outcomer, 'PUT')
      const template = (variables: typeof data) => `/api/users/${variables.id}`

      const { result } = renderHook(() => execute(template, { key: ['put-template'] }), {
        wrapper,
      })
      result.current.handlers.fire(data)

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.responses.success?.data).toEqual(data)
    })

    test('文字列を指定して、データを部分更新すること', async () => {
      const data = { id: 1, name: 'Patched' }
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const execute = createMutation(outcomer, 'PATCH')

      const { result } = renderHook(() => execute('/api/patch', { key: ['patch-string'] }), {
        wrapper,
      })
      result.current.handlers.fire(data)

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.responses.success?.data).toEqual(data)
    })

    test('サーバーアクションを指定して、データを部分更新すること', async () => {
      const data = { id: 1, name: 'Patched' }
      const execute = createMutation(outcomer, 'PATCH')
      const action = async (): Promise<Outcome<typeof data>> => ({
        success: true,
        status: StatusCodes.OK,
        data,
      })

      const { result } = renderHook(() => execute(action, { key: ['patch-action'] }), {
        wrapper,
      })
      result.current.handlers.fire(data)

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.responses.success?.data).toEqual(data)
    })

    test('テンプレート関数を指定して、データを部分更新すること', async () => {
      const data = { id: 1, name: 'Patched' }
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const execute = createMutation(outcomer, 'PATCH')
      const template = (variables: typeof data) => `/api/users/${variables.id}`

      const { result } = renderHook(() => execute(template, { key: ['patch-template'] }), {
        wrapper,
      })
      result.current.handlers.fire(data)

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.responses.success?.data).toEqual(data)
    })

    test('文字列を指定して、データを削除すること', async () => {
      const data = { id: 1, name: 'Deleted' }
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const execute = createMutation(outcomer, 'DELETE')

      const { result } = renderHook(() => execute('/api/delete', { key: ['delete-string'] }), {
        wrapper,
      })
      result.current.handlers.fire(data)

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.responses.success?.data).toEqual(data)
    })

    test('サーバーアクションを指定して、データを削除すること', async () => {
      const data = { id: 1, name: 'Deleted' }
      const execute = createMutation(outcomer, 'DELETE')
      const action = async (): Promise<Outcome<typeof data>> => ({
        success: true,
        status: StatusCodes.OK,
        data,
      })

      const { result } = renderHook(() => execute(action, { key: ['delete-action'] }), {
        wrapper,
      })
      result.current.handlers.fire(data)

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.responses.success?.data).toEqual(data)
    })

    test('テンプレート関数を指定して、データを削除すること', async () => {
      const data = { id: 1, name: 'Deleted' }
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const execute = createMutation(outcomer, 'DELETE')
      const template = (variables: typeof data) => `/api/users/${variables.id}`

      const { result } = renderHook(() => execute(template, { key: ['delete-template'] }), {
        wrapper,
      })
      result.current.handlers.fire(data)

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.responses.success?.data).toEqual(data)
    })

    test('文字列を指定して、キャッシュを無効化できること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(null, {
          status: StatusCodes.CREATED,
        }),
      )
      const execute = createMutation(outcomer, 'POST')
      const invalidate = vi.spyOn(tanstack, 'invalidateQueries')
      const options = ['users', 'posts']

      const { result } = renderHook(
        () =>
          execute('/api/create', {
            key: ['string-invalidate'],
            invalidates: options,
          }),
        { wrapper },
      )
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(invalidate).toHaveBeenCalledTimes(2)
      expect(invalidate).toHaveBeenCalledWith({ queryKey: [options[0]] })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: [options[1]] })
    })

    test('キー配列を指定して、キャッシュを無効化できること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(null, {
          status: StatusCodes.CREATED,
        }),
      )
      const execute = createMutation(outcomer, 'POST')
      const invalidate = vi.spyOn(tanstack, 'invalidateQueries')
      const options = [['users'], ['posts']]

      const { result } = renderHook(
        () =>
          execute('/api/create', {
            key: ['array-invalidate'],
            invalidates: options,
          }),
        { wrapper },
      )
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(invalidate).toHaveBeenCalledTimes(2)
      expect(invalidate).toHaveBeenCalledWith({ queryKey: options[0] })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: options[1] })
    })

    test('オブジェクトを指定して、キャッシュを無効化できること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(null, {
          status: StatusCodes.CREATED,
        }),
      )
      const execute = createMutation(outcomer, 'POST')
      const invalidate = vi.spyOn(tanstack, 'invalidateQueries')
      const predicate = vi.fn(() => true)
      const options = [
        {
          key: ['users'],
          mode: 'all' as const,
          exact: true,
          refetch: 'active' as const,
          stale: true,
          status: 'idle' as const,
          predicate,
        },
      ]

      const { result } = renderHook(
        () =>
          execute('/api/create', {
            key: ['object-invalidate'],
            invalidates: options,
          }),
        { wrapper },
      )
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(invalidate).toHaveBeenCalledTimes(1)
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: options[0]?.key,
        type: options[0]?.mode,
        exact: options[0]?.exact,
        refetchType: options[0]?.refetch,
        stale: options[0]?.stale,
        fetchStatus: options[0]?.status,
        predicate: options[0]?.predicate,
      })
    })

    test('様々なパターンを組み合わせて、キャッシュを無効化できること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(null, {
          status: StatusCodes.CREATED,
        }),
      )
      const execute = createMutation(outcomer, 'POST')
      const invalidate = vi.spyOn(tanstack, 'invalidateQueries')
      const predicate = vi.fn(() => true)
      const options1 = ['users']
      const options2 = ['posts']
      const options3 = ['comments', 1]
      const options4 = { key: ['notifications'], mode: 'all' as const, predicate }
      const options5 = ['features-1', 'features-2', 'features-3']
      const options = [options1, options2, options3, options4, options5]

      const { result } = renderHook(
        () =>
          execute('/api/create', {
            key: ['mixed-invalidate'],
            invalidates: options,
          }),
        { wrapper },
      )
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(invalidate).toHaveBeenCalledTimes(5)
      expect(invalidate).toHaveBeenCalledWith({ queryKey: options1 })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: options2 })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: options3 })
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: options4.key,
        type: options4.mode,
        exact: undefined,
        refetchType: undefined,
        stale: undefined,
        fetchStatus: undefined,
        predicate: options4.predicate,
      })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: options5 })
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: getReasonPhrase(StatusCodes.BAD_REQUEST) }), {
          status: StatusCodes.BAD_REQUEST,
        }),
      )
      const execute = createMutation(outcomer, 'PUT')

      const { result } = renderHook(() => execute('/api/4xx', { key: ['put-4xx'] }), {
        wrapper,
      })
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.failed).not.toBeNull()
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
          }),
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
          },
        ),
      )
      const execute = createMutation(outcomer, 'PATCH')

      const { result } = renderHook(() => execute('/api/5xx', { key: ['patch-5xx'] }), {
        wrapper,
      })
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.failed).not.toBeNull()
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const execute = createMutation(outcomer, 'DELETE')
      const action = async () => {
        throw new Error('The action was aborted')
      }

      const { result } = renderHook(() => execute(action, { key: ['delete-thrown'] }), {
        wrapper,
      })
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
    })
  })
})
