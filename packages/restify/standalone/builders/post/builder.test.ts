import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

import { instance, type Outcome, type Outcomer } from '@outcomify/requestify'

import { createPost } from './builder'

describe('builder.ts', () => {
  let outcomer: Outcomer

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    outcomer = instance({ base: 'https://api.example.com' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('createPost', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      const body = { name: 'Posted' }
      const data = { id: 1, ...body }
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.CREATED,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const execute = createPost(outcomer)

      const response = await execute('/users', body)

      expect(response).toEqual({
        success: true,
        status: StatusCodes.CREATED,
        data,
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
      const execute = createPost(outcomer)

      const response = await execute(action)

      expect(response).toEqual({
        success: true,
        status: StatusCodes.CREATED,
        data,
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
      const execute = createPost(outcomer)

      const response = await execute('/users', { name: 'post-4xx' })

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
      const execute = createPost(outcomer)

      const response = await execute('/users', { name: 'post-5xx' })

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
      const execute = createPost(outcomer)

      const response = await execute(action)

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'The post operation was aborted',
      })
    })
  })
})
