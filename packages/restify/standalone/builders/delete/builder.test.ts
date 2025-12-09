import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

import { instance, type Outcome, type Outcomer } from '@outcomify/requestify'

import { createDelete } from './builder'

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

  describe('createDelete', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(null, {
          status: StatusCodes.NO_CONTENT,
        }),
      )
      const execute = createDelete(outcomer)

      const response = await execute('/users/1')

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
      const execute = createDelete(outcomer)

      const response = await execute(action)

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
      const execute = createDelete(outcomer)

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
      const execute = createDelete(outcomer)

      const response = await execute('/users/1')

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
      const execute = createDelete(outcomer)

      const response = await execute(action)

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'The delete operation was aborted',
      })
    })
  })
})
