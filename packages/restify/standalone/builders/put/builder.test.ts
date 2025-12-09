import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

import { instance, type Outcome, type Outcomer } from '@outcomify/requestify'

import { createPut } from './builder'

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

  describe('createPut', () => {
    test('文字列を指定して、成功結果を取得すること', async () => {
      const body = { name: 'Put' }
      const data = { id: 1, ...body }
      vi.mocked(global.fetch).mockResolvedValue(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      const execute = createPut(outcomer)

      const response = await execute('/users/1', body)

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data,
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
      const execute = createPut(outcomer)

      const response = await execute(action)

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data,
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
      const execute = createPut(outcomer)

      const response = await execute('/users/999', { name: 'put-4xx' })

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
      const execute = createPut(outcomer)

      const response = await execute('/users/1', { name: 'put-5xx' })

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
      const execute = createPut(outcomer)

      const response = await execute(action)

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'The put operation was aborted',
      })
    })
  })
})
