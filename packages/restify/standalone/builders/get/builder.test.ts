import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

import { instance, VerifyError, type Outcome, type Outcomer } from '@outcomify/requestify'

import { createGet } from './builder'

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

  describe('createGet', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      const data = { id: 1, name: 'Got' }
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const execute = createGet(outcomer)

      const response = await execute('/users/1')

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
      const execute = createGet(outcomer)

      const response = await execute(action)

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
      const execute = createGet(outcomer)

      const response = await execute('/users/999')

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
      const execute = createGet(outcomer)

      const response = await execute('/users/1')

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
      const execute = createGet(outcomer)

      const response = await execute(action)

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
      const execute = createGet(outcomer)

      const response = await execute(action, {
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
      const execute = createGet(outcomer)

      const response = await execute(action, {
        verify: (data) => 'id' in data,
      })

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: new VerifyError().message,
      })
    })
  })
})
