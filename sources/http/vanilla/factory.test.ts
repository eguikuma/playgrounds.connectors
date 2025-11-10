import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

import { factory } from './factory'
import { VerifyError } from '../core/errors'
import type { Outcome } from '../core/models'

describe('factory.ts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('get', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      const data = { id: 1, name: 'Got' }
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.get<typeof data>('/users/1')

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data,
      })
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'GET',
        }),
      )
    })

    test('関数を指定して、成功結果を取得すること', async () => {
      const data = { id: 1, name: 'Got' }
      const action = vi.fn(
        async (): Promise<Outcome<typeof data>> => ({
          success: true,
          status: StatusCodes.OK,
          data,
        }),
      )
      const request = factory()

      const response = await request.get<typeof data>(action)

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data,
      })
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
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.get('/users/999')

      expect(response).toEqual({
        success: false,
        status: StatusCodes.NOT_FOUND,
        message: getReasonPhrase(StatusCodes.NOT_FOUND),
      })
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) }),
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.get('/users/1')

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
      const request = factory()

      const response = await request.get(action)

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'The get operation was aborted',
      })
    })

    test('検証をパスした場合、成功結果を返すこと', async () => {
      const data = { id: 1, name: 'Got' }
      const action = vi.fn(
        async (): Promise<Outcome<typeof data>> => ({
          success: true,
          status: StatusCodes.OK,
          data,
        }),
      )
      const request = factory()

      const response = await request.get<typeof data>(action, {
        verify: (response) => 'id' in response && 'name' in response,
      })

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data,
      })
    })

    test('検証をパスしなかった場合、失敗結果を返すこと', async () => {
      const action = vi.fn(
        async (): Promise<Outcome<{ id: number }>> => ({
          success: true,
          status: StatusCodes.OK,
          data: { wrong: 'data' } as unknown as { id: number },
        }),
      )
      const request = factory()

      const response = await request.get<{ id: number }>(action, {
        verify: (data) => 'id' in data,
      })

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: new VerifyError().message,
      })
    })
  })

  describe('post', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      const body = { name: 'Posted' }
      const data = { id: 1, ...body }
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.CREATED,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.post<typeof data>('/users', body)

      expect(response).toEqual({
        success: true,
        status: StatusCodes.CREATED,
        data: data,
      })
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        }),
      )
    })

    test('関数を指定して、成功結果を取得すること', async () => {
      const data = { id: 1, name: 'Posted' }
      const action = vi.fn(
        async (): Promise<Outcome<typeof data>> => ({
          success: true,
          status: StatusCodes.CREATED,
          data,
        }),
      )
      const request = factory()

      const response = await request.post<typeof data>(action)

      expect(response).toEqual({
        success: true,
        status: StatusCodes.CREATED,
        data: data,
      })
      expect(action).toHaveBeenCalled()
      expect(global.fetch).not.toHaveBeenCalled()
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify({ message: getReasonPhrase(StatusCodes.BAD_REQUEST) }), {
          status: StatusCodes.BAD_REQUEST,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.post('/users', { name: 'post-4xx' })

      expect(response).toEqual({
        success: false,
        status: StatusCodes.BAD_REQUEST,
        message: getReasonPhrase(StatusCodes.BAD_REQUEST),
      })
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) }),
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.post('/users', { name: 'post-5xx' })

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      })
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const action = vi.fn(async () => {
        throw new Error('The post operation was aborted')
      })
      const request = factory()

      const response = await request.post(action)

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'The post operation was aborted',
      })
    })
  })

  describe('put', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      const body = { name: 'Put' }
      const data = { id: 1, ...body }
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.put<typeof data>('/users/1', body)

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data: data,
      })
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
        }),
      )
    })

    test('関数を指定して、成功結果を取得すること', async () => {
      const data = { id: 1, name: 'Put' }
      const action = vi.fn(
        async (): Promise<Outcome<typeof data>> => ({
          success: true,
          status: StatusCodes.OK,
          data,
        }),
      )
      const request = factory()

      const response = await request.put<typeof data>(action)

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data: data,
      })
      expect(action).toHaveBeenCalled()
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify({ message: getReasonPhrase(StatusCodes.NOT_FOUND) }), {
          status: StatusCodes.NOT_FOUND,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.put('/users/999', { name: 'put-4xx' })

      expect(response).toEqual({
        success: false,
        status: StatusCodes.NOT_FOUND,
        message: getReasonPhrase(StatusCodes.NOT_FOUND),
      })
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) }),
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.put('/users/1', { name: 'put-5xx' })

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      })
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const action = vi.fn(async () => {
        throw new Error('The put operation was aborted')
      })
      const request = factory()

      const response = await request.put(action)

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'The put operation was aborted',
      })
    })
  })

  describe('patch', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      const body = { name: 'Patched' }
      const data = { id: 1, ...body }
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.patch<typeof data>('/users/1', body)

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data: data,
      })
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      )
    })

    test('関数を指定して、成功結果を取得すること', async () => {
      const data = { id: 1, name: 'Patched' }
      const action = vi.fn(
        async (): Promise<Outcome<typeof data>> => ({
          success: true,
          status: StatusCodes.OK,
          data,
        }),
      )
      const request = factory()

      const response = await request.patch<typeof data>(action)

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data: data,
      })
      expect(action).toHaveBeenCalled()
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify({ message: getReasonPhrase(StatusCodes.BAD_REQUEST) }), {
          status: StatusCodes.BAD_REQUEST,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.patch('/users/1', { name: 'patch-4xx' })

      expect(response).toEqual({
        success: false,
        status: StatusCodes.BAD_REQUEST,
        message: getReasonPhrase(StatusCodes.BAD_REQUEST),
      })
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) }),
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.patch('/users/1', { name: 'patch-5xx' })

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      })
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const action = vi.fn(async () => {
        throw new Error('The patch operation was aborted')
      })
      const request = factory()

      const response = await request.patch(action)

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'The patch operation was aborted',
      })
    })
  })

  describe('delete', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(null, {
          status: StatusCodes.NO_CONTENT,
        }),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.delete('/users/1')

      expect(response).toEqual({
        success: true,
        status: StatusCodes.NO_CONTENT,
        data: undefined,
      })
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'DELETE',
        }),
      )
    })

    test('関数を指定して、成功結果を取得すること', async () => {
      const action = vi.fn(
        async (): Promise<Outcome<unknown>> => ({
          success: true,
          status: StatusCodes.NO_CONTENT,
          data: undefined,
        }),
      )
      const request = factory()

      const response = await request.delete(action)

      expect(response).toEqual({
        success: true,
        status: StatusCodes.NO_CONTENT,
        data: undefined,
      })
      expect(action).toHaveBeenCalled()
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify({ message: getReasonPhrase(StatusCodes.NOT_FOUND) }), {
          status: StatusCodes.NOT_FOUND,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.delete('/users/999')

      expect(response).toEqual({
        success: false,
        status: StatusCodes.NOT_FOUND,
        message: getReasonPhrase(StatusCodes.NOT_FOUND),
      })
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({ message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) }),
          {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      const request = factory({ base: 'https://api.example.com' })

      const response = await request.delete('/users/1')

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      })
    })

    test('エラーが発生した場合、失敗結果を返すこと', async () => {
      const action = vi.fn(async () => {
        throw new Error('The delete operation was aborted')
      })
      const request = factory()

      const response = await request.delete(action)

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'The delete operation was aborted',
      })
    })
  })
})
