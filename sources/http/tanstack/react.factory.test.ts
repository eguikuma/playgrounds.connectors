import { createElement } from 'react'
import type { ReactNode } from 'react'

import { renderHook, waitFor } from '@testing-library/react'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { factory } from './react.factory'
import type { Outcome } from '../core/models'

describe('react.factory.ts', () => {
  let tanstack: QueryClient
  let wrapper: ({ children }: { children: ReactNode }) => ReactNode

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())

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

  describe('get', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1, name: 'Get' }), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const request = factory()

      const { result } = renderHook(() => request.get('/api/me', { key: ['get-string'] }), {
        wrapper,
      })

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success?.data).toEqual({ id: 1, name: 'Get' })
      expect(result.current.states.failed).toBe(false)
    })

    test('サーバーアクションを指定して、成功結果を取得すること', async () => {
      const request = factory()
      const action = async (): Promise<Outcome<{ id: number; name: string }>> => ({
        success: true,
        status: StatusCodes.OK,
        data: { id: 1, name: 'Get' },
      })

      const { result } = renderHook(() => request.get(action, { key: ['get-action'] }), { wrapper })

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.responses.success?.data).toEqual({ id: 1, name: 'Get' })
      expect(result.current.states.failed).toBe(false)
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      const request = factory()
      const action = async (): Promise<Outcome<unknown>> => ({
        success: false,
        status: StatusCodes.BAD_REQUEST,
        message: getReasonPhrase(StatusCodes.BAD_REQUEST),
      })

      const { result } = renderHook(() => request.get(action, { key: ['get-4xx'] }), { wrapper })

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toBeUndefined()
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      const request = factory()
      const action = async () => {
        throw new Response(null, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }

      const { result } = renderHook(() => request.get(action, { key: ['get-5xx'] }), { wrapper })

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toBeUndefined()
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const request = factory()
      const action = async () => {
        throw new Error('The query action was aborted')
      }

      const { result } = renderHook(() => request.get(action, { key: ['get-thrown'] }), { wrapper })

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.success).toBeUndefined()
    })
  })

  describe('infinite', () => {
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
      const request = factory()

      const { result } = renderHook(
        () =>
          request.infinite('/api/data', {
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
      const request = factory()
      const action = async ({ page }: { page: number }): Promise<Outcome<{ id: number }[]>> => ({
        success: true,
        status: StatusCodes.OK,
        data: Array.from({ length: 9 }, (_, index) => ({ id: index + 1 + page * 9 })),
      })

      const { result } = renderHook(
        () =>
          request.infinite(action, {
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
      const request = factory()
      const template = ({ page }: { page: number }) => `/api/data?page=${page}`

      const { result } = renderHook(
        () =>
          request.infinite(template, {
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
      const request = factory()
      const action = async (_: { page: number }): Promise<Outcome<unknown>> => ({
        success: false,
        status: StatusCodes.BAD_REQUEST,
        message: getReasonPhrase(StatusCodes.BAD_REQUEST),
      })

      const { result } = renderHook(
        () =>
          request.infinite(action, {
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
      const request = factory()
      const action = async (_: { page: number }) => {
        throw new Response(null, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }

      const { result } = renderHook(
        () =>
          request.infinite(action, {
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
      const request = factory()
      const action = async (_: { page: number }) => {
        throw new Error('The infinite action was aborted')
      }

      const { result } = renderHook(
        () =>
          request.infinite(action, {
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

  describe('post', () => {
    test('文字列を指定して、データを作成すること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 2, name: 'Posted' }), {
          status: StatusCodes.CREATED,
        }),
      )
      const request = factory()

      const { result } = renderHook(() => request.post('/api/create', { key: ['post-string'] }), {
        wrapper,
      })
      result.current.handlers.fire({ name: 'Posted' })

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
    })

    test('サーバーアクションを指定して、データを作成すること', async () => {
      const request = factory()
      const action = async (): Promise<Outcome<{ id: number; name: string }>> => ({
        success: true,
        status: StatusCodes.CREATED,
        data: { id: 1, name: 'Created' },
      })

      const { result } = renderHook(() => request.post(action, { key: ['post-action'] }), {
        wrapper,
      })
      result.current.handlers.fire()

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.states.pending).toBe(false)
    })

    test('テンプレート関数を指定して、データを作成すること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 3, name: 'Created' }), {
          status: StatusCodes.CREATED,
        }),
      )
      const request = factory()
      const template = (data: { name: string }) => `/api/users?name=${data.name}`

      const { result } = renderHook(() => request.post(template, { key: ['post-template'] }), {
        wrapper,
      })
      result.current.handlers.fire({ name: 'Created' })

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
    })

    test('キーを指定して、キャッシュを無効化できること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 3 }), {
          status: StatusCodes.CREATED,
        }),
      )
      const request = factory()
      const invalidate = vi.spyOn(tanstack, 'invalidateQueries')

      const { result } = renderHook(
        () =>
          request.post('/api/create', {
            key: ['post-invalidate'],
            invalidates: [['users'], ['posts']],
          }),
        { wrapper },
      )
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['users'] })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['posts'] })
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: getReasonPhrase(StatusCodes.BAD_REQUEST) }), {
          status: StatusCodes.BAD_REQUEST,
        }),
      )
      const request = factory()

      const { result } = renderHook(() => request.post('/api/create', { key: ['post-4xx'] }), {
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
          JSON.stringify({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) }),
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
          },
        ),
      )
      const request = factory()

      const { result } = renderHook(() => request.post('/api/create', { key: ['post-5xx'] }), {
        wrapper,
      })
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.failed).not.toBeNull()
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const request = factory()
      const action = async () => {
        throw new Error('The post action was aborted')
      }

      const { result } = renderHook(() => request.post(action, { key: ['post-thrown'] }), {
        wrapper,
      })
      result.current.handlers.fire()

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
    })
  })

  describe('put', () => {
    test('文字列を指定して、データを更新すること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1, name: 'Put' }), {
          status: StatusCodes.OK,
        }),
      )
      const request = factory()

      const { result } = renderHook(() => request.put('/api/update', { key: ['put-string'] }), {
        wrapper,
      })
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
    })

    test('サーバーアクションを指定して、データを更新すること', async () => {
      const request = factory()
      const action = async (): Promise<Outcome<{ id: number; name: string }>> => ({
        success: true,
        status: StatusCodes.OK,
        data: { id: 1, name: 'Put' },
      })

      const { result } = renderHook(() => request.put(action, { key: ['put-action'] }), { wrapper })
      result.current.handlers.fire()

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.states.pending).toBe(false)
    })

    test('テンプレート関数を指定して、データを更新すること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1, name: 'Put' }), {
          status: StatusCodes.OK,
        }),
      )
      const request = factory()
      const template = (data: { id: number }) => `/api/users/${data.id}`

      const { result } = renderHook(() => request.put(template, { key: ['put-template'] }), {
        wrapper,
      })
      result.current.handlers.fire({ id: 1 })

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
    })

    test('キーを指定して、キャッシュを無効化できること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1, name: 'Put' }), {
          status: StatusCodes.OK,
        }),
      )
      const request = factory()
      const invalidate = vi.spyOn(tanstack, 'invalidateQueries')

      const { result } = renderHook(
        () =>
          request.put('/api/update', {
            key: ['put-invalidate'],
            invalidates: [['articles'], ['users']],
          }),
        { wrapper },
      )
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['articles'] })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['users'] })
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: getReasonPhrase(StatusCodes.NOT_FOUND) }), {
          status: StatusCodes.NOT_FOUND,
        }),
      )
      const request = factory()

      const { result } = renderHook(() => request.put('/api/update', { key: ['put-4xx'] }), {
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
          JSON.stringify({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) }),
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
          },
        ),
      )
      const request = factory()

      const { result } = renderHook(() => request.put('/api/update', { key: ['put-5xx'] }), {
        wrapper,
      })
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.failed).not.toBeNull()
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const request = factory()
      const action = async () => {
        throw new Error('The put action was aborted')
      }

      const { result } = renderHook(() => request.put(action, { key: ['put-thrown'] }), { wrapper })
      result.current.handlers.fire()

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
    })
  })

  describe('patch', () => {
    test('文字列を指定して、データを部分更新すること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1, name: 'Patched' }), {
          status: StatusCodes.OK,
        }),
      )
      const request = factory()

      const { result } = renderHook(() => request.patch('/api/patch', { key: ['patch-string'] }), {
        wrapper,
      })
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
    })

    test('サーバーアクションを指定して、データを部分更新すること', async () => {
      const request = factory()
      const action = async (): Promise<Outcome<{ id: number; name: string }>> => ({
        success: true,
        status: StatusCodes.OK,
        data: { id: 1, name: 'Patched' },
      })

      const { result } = renderHook(() => request.patch(action, { key: ['patch-action'] }), {
        wrapper,
      })
      result.current.handlers.fire()

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.states.pending).toBe(false)
    })

    test('テンプレート関数を指定して、データを部分更新すること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1, name: 'Patched' }), {
          status: StatusCodes.OK,
        }),
      )
      const request = factory()
      const template = (data: { id: number }) => `/api/users/${data.id}`

      const { result } = renderHook(() => request.patch(template, { key: ['patch-template'] }), {
        wrapper,
      })
      result.current.handlers.fire({ id: 1 })

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
    })

    test('キーを指定して、キャッシュを無効化できること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1, name: 'Patched' }), {
          status: StatusCodes.OK,
        }),
      )
      const request = factory()
      const invalidate = vi.spyOn(tanstack, 'invalidateQueries')

      const { result } = renderHook(
        () =>
          request.patch('/api/patch', {
            key: ['patch-invalidate'],
            invalidates: [['articles'], ['cache']],
          }),
        { wrapper },
      )
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['articles'] })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['cache'] })
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: getReasonPhrase(StatusCodes.BAD_REQUEST) }), {
          status: StatusCodes.BAD_REQUEST,
        }),
      )
      const request = factory()

      const { result } = renderHook(() => request.patch('/api/patch', { key: ['patch-4xx'] }), {
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
          JSON.stringify({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) }),
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
          },
        ),
      )
      const request = factory()

      const { result } = renderHook(() => request.patch('/api/patch', { key: ['patch-5xx'] }), {
        wrapper,
      })
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.failed).not.toBeNull()
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const request = factory()
      const action = async () => {
        throw new Error('The patch action was aborted')
      }

      const { result } = renderHook(() => request.patch(action, { key: ['patch-thrown'] }), {
        wrapper,
      })
      result.current.handlers.fire()

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
    })
  })

  describe('delete', () => {
    test('文字列を指定して、データを削除すること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ name: 'Deleted' }), {
          status: StatusCodes.OK,
        }),
      )
      const request = factory()

      const { result } = renderHook(
        () => request.delete('/api/delete', { key: ['delete-string'] }),
        {
          wrapper,
        },
      )
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
    })

    test('サーバーアクションを指定して、データを削除すること', async () => {
      const request = factory()
      const action = async (): Promise<Outcome<{ id: number; name: string }>> => ({
        success: true,
        status: StatusCodes.OK,
        data: { id: 1, name: 'Deleted' },
      })

      const { result } = renderHook(() => request.delete(action, { key: ['delete-action'] }), {
        wrapper,
      })
      result.current.handlers.fire()

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
      expect(result.current.states.pending).toBe(false)
    })

    test('テンプレート関数を指定して、データを削除すること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ name: 'Deleted' }), {
          status: StatusCodes.OK,
        }),
      )
      const request = factory()
      const template = (data: { id: number }) => `/api/users/${data.id}`

      const { result } = renderHook(() => request.delete(template, { key: ['delete-template'] }), {
        wrapper,
      })
      result.current.handlers.fire({ id: 1 })

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(result.current.states.failed).toBe(false)
    })

    test('キーを指定して、キャッシュを無効化できること', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ name: 'Deleted' }), {
          status: StatusCodes.OK,
        }),
      )
      const request = factory()
      const invalidate = vi.spyOn(tanstack, 'invalidateQueries')

      const { result } = renderHook(
        () =>
          request.delete('/api/delete', {
            key: ['delete-invalidate'],
            invalidates: [['articles'], ['list']],
          }),
        { wrapper },
      )
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.success).toBe(true))
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['articles'] })
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['list'] })
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: getReasonPhrase(StatusCodes.NOT_FOUND) }), {
          status: StatusCodes.NOT_FOUND,
        }),
      )
      const request = factory()

      const { result } = renderHook(() => request.delete('/api/delete', { key: ['delete-4xx'] }), {
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
          JSON.stringify({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) }),
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
          },
        ),
      )
      const request = factory()

      const { result } = renderHook(() => request.delete('/api/delete', { key: ['delete-5xx'] }), {
        wrapper,
      })
      result.current.handlers.fire({})

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
      expect(result.current.responses.failed).not.toBeNull()
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const request = factory()
      const action = async () => {
        throw new Error('The delete action was aborted')
      }

      const { result } = renderHook(() => request.delete(action, { key: ['delete-thrown'] }), {
        wrapper,
      })
      result.current.handlers.fire()

      await waitFor(() => expect(result.current.states.failed).toBe(true))
      expect(result.current.states.success).toBe(false)
    })
  })
})
