import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, expect, test } from 'vitest'

import { failify, headerify, outcomify, pass, successify, unify, unwrap } from './normalize'

describe('normalize.ts', () => {
  describe('headerify', () => {
    test('未指定の場合、空オブジェクトを返すこと', () => {
      expect(headerify()).toEqual({})
      expect(headerify(undefined)).toEqual({})
    })

    test('Headersオブジェクトの場合、オブジェクトに変換すること', () => {
      const value = new Headers({ 'X-Key': 'value', 'Content-Type': 'application/json' })

      expect(headerify(value)).toEqual({ 'X-Key': 'value', 'Content-Type': 'application/json' })
    })

    test('配列の場合、オブジェクトに変換すること', () => {
      const value: [string, string][] = [
        ['X-Key', 'value'],
        ['Content-Type', 'application/json'],
      ]

      expect(headerify(value)).toEqual({ 'X-Key': 'value', 'Content-Type': 'application/json' })
    })

    test('オブジェクトの場合、そのまま返すこと', () => {
      const value = { 'X-Key': 'value', 'Content-Type': 'application/json' }

      expect(headerify(value)).toEqual({ 'X-Key': 'value', 'Content-Type': 'application/json' })
    })
  })

  describe('successify', () => {
    test('ステータスが未指定の場合、成功結果を返すこと', async () => {
      const data = { message: getReasonPhrase(StatusCodes.OK) }

      expect(successify(data)).toEqual({
        success: true,
        status: StatusCodes.OK,
        data,
      })
    })

    test('ステータスが指定された場合、成功結果を返すこと', async () => {
      const data = { message: getReasonPhrase(StatusCodes.CREATED) }

      expect(successify(data, StatusCodes.CREATED)).toEqual({
        success: true,
        status: StatusCodes.CREATED,
        data,
      })
    })
  })

  describe('failify', () => {
    test('JSONの場合、失敗結果を返すこと', async () => {
      const data = { message: 'I am a message' }

      const response = await failify(
        new Response(JSON.stringify(data), {
          status: StatusCodes.BAD_REQUEST,
        }),
      )

      expect(response).toEqual({
        success: false,
        status: StatusCodes.BAD_REQUEST,
        message: data.message,
        body: data,
      })
    })

    test('JSONの場合、失敗結果に完全なレスポンスを格納すること', async () => {
      const body = {
        message: 'I am a message',
        errors: ['Field1 is invalid', 'Field2 is invalid'],
      }

      const response = await failify(
        new Response(JSON.stringify(body), {
          status: StatusCodes.UNPROCESSABLE_ENTITY,
        }),
      )

      if (!response.success) {
        expect(response.body).toEqual(body)
      }
    })

    test('JSONパースに失敗した場合、フォールバック処理を行うこと', async () => {
      const response = await failify(
        new Response('I am not JSON', {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        }),
      )

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      })
      if (!response.success) {
        expect(response.body).toBeUndefined()
      }
    })

    test('中断された場合、失敗結果を返すこと', async () => {
      const response = await failify(new DOMException('The operation was aborted', 'AbortError'))

      expect(response).toEqual({
        success: false,
        status: StatusCodes.REQUEST_TIMEOUT,
        message: getReasonPhrase(StatusCodes.REQUEST_TIMEOUT),
      })
    })

    test('リダイレクト拒否の場合、失敗結果を返すこと', async () => {
      const response = await failify(new TypeError('Failed to fetch'), { redirect: 'error' })

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Redirect not allowed',
      })
    })

    test('リダイレクト拒否以外の場合、失敗結果を返すこと', async () => {
      const thrown = new TypeError('Failed to fetch')

      const response = await failify(thrown, { redirect: 'follow' })

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: thrown.message,
      })
    })

    test('例外オブジェクトの場合、失敗結果を返すこと', async () => {
      const thrown = new Error('I was thrown')

      const response = await failify(thrown)

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: thrown.message,
      })
    })

    test('その他の場合、失敗結果を返すこと', async () => {
      const response = await failify('unknown')

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      })
    })
  })

  describe('outcomify', () => {
    test('2xxの場合、成功結果を返すこと', async () => {
      const data = { id: 1, name: 'test' }

      const response = await outcomify(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data,
      })
    })

    test(`${StatusCodes.NO_CONTENT}の場合、undefinedを返すこと`, async () => {
      const response = await outcomify(new Response(null, { status: StatusCodes.NO_CONTENT }))

      expect(response).toEqual({
        success: true,
        status: StatusCodes.NO_CONTENT,
        data: undefined,
      })
    })

    test('4xxの場合、失敗結果を返すこと', async () => {
      const body = { error: getReasonPhrase(StatusCodes.NOT_FOUND) }

      const response = await outcomify(
        new Response(JSON.stringify(body), {
          status: StatusCodes.NOT_FOUND,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      expect(response).toEqual({
        success: false,
        status: StatusCodes.NOT_FOUND,
        message: getReasonPhrase(StatusCodes.NOT_FOUND),
        body: body,
      })
    })

    test('5xxの場合、失敗結果を返すこと', async () => {
      const body = {
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      }

      const response = await outcomify(
        new Response(JSON.stringify(body), {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        body: body,
      })
    })

    test('検証関数が未指定の場合、成功結果を返すこと', async () => {
      const data = { id: 1, name: 'test' }

      const response = await outcomify(
        new Response(JSON.stringify(data), {
          status: StatusCodes.OK,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data,
      })
    })
  })

  describe('unify', () => {
    test('ソースが文字列の場合、成功結果を返すこと', async () => {
      const data = { id: 1 }
      const executor = async () => ({
        success: true as const,
        status: StatusCodes.OK,
        data,
      })

      const response = await unify({
        source: '/api/users',
        executor,
      })

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data,
      })
    })

    test('ソースが関数の場合、成功結果を返すこと', async () => {
      const data = { id: 1 }
      const executor = async () => ({
        success: true as const,
        status: StatusCodes.OK,
        data,
      })

      const response = await unify({
        source: () => '/api/users',
        executor,
      })

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data,
      })
    })

    test('ソースが動的パラメータの場合、成功結果を返すこと', async () => {
      const executor = async (endpoint: string) => ({
        success: true as const,
        status: StatusCodes.OK,
        data: { endpoint },
      })

      const response = await unify({
        source: (id, name) => `/api/users/${id}/${name}`,
        parameters: [1, 'test'],
        executor,
      })

      expect(response).toEqual({
        success: true,
        status: StatusCodes.OK,
        data: { endpoint: '/api/users/1/test' },
      })
    })

    test('ハンドラー内でエラーが発生した場合、失敗結果を返すこと', async () => {
      const executor = async () => {
        throw new Error('The execution was aborted')
      }

      const response = await unify({
        source: '/api/users',
        executor,
      })

      expect(response).toEqual({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'The execution was aborted',
      })
    })
  })

  describe('unwrap', () => {
    describe('Content-Type', () => {
      test('application/jsonの場合、JSONとして取得すること', async () => {
        const data = { name: 'test' }

        const response = await unwrap(
          new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' },
          }),
        )

        expect(response).toEqual(data)
      })

      test('text/plainの場合、テキストとして取得すること', async () => {
        const text = 'test text'

        const response = await unwrap(
          new Response(text, {
            headers: { 'Content-Type': 'text/plain' },
          }),
        )

        expect(response).toBe(text)
      })

      test('application/xmlの場合、テキストとして取得すること', async () => {
        const xml = '<?xml version="1.0"?><root><item>test</item></root>'

        const response = await unwrap(
          new Response(xml, {
            status: StatusCodes.OK,
            headers: { 'Content-Type': 'application/xml' },
          }),
        )

        expect(response).toBe(xml)
      })

      test('text/xmlの場合、テキストとして取得すること', async () => {
        const xml = '<?xml version="1.0"?><data>test</data>'

        const response = await unwrap(
          new Response(xml, {
            status: StatusCodes.OK,
            headers: { 'Content-Type': 'text/xml' },
          }),
        )

        expect(response).toBe(xml)
      })

      test('application/octet-streamの場合、テキストとして取得すること', async () => {
        const data = { name: 'test' }
        const text = JSON.stringify(data)

        const response = await unwrap(
          new Response(text, {
            status: StatusCodes.OK,
            headers: { 'Content-Type': 'application/octet-stream' },
          }),
        )

        expect(response).toEqual(text)
      })

      test('未指定の場合、テキストとして取得すること', async () => {
        const text = 'plain text'

        const response = await unwrap(new Response(text, { status: StatusCodes.OK }))

        expect(response).toBe(text)
      })
    })

    describe('status', () => {
      test(`${StatusCodes.NO_CONTENT}の場合、undefinedを返すこと`, async () => {
        const response = await unwrap(new Response(null, { status: StatusCodes.NO_CONTENT }))

        expect(response).toBeUndefined()
      })
    })
  })

  describe('pass', () => {
    test('未指定で2xxの場合、trueを返すこと', () => {
      expect(pass(StatusCodes.OK)).toBe(true)
      expect(pass(StatusCodes.CREATED)).toBe(true)
      expect(pass(StatusCodes.NO_CONTENT)).toBe(true)
    })

    test('未指定で2xx以外の場合、falseを返すこと', () => {
      expect(pass(StatusCodes.MOVED_TEMPORARILY)).toBe(false)
      expect(pass(StatusCodes.BAD_REQUEST)).toBe(false)
      expect(pass(StatusCodes.INTERNAL_SERVER_ERROR)).toBe(false)
    })

    test('成功として指定されたコードの場合、trueを返すこと', () => {
      const rule = { success: [StatusCodes.BAD_REQUEST] }

      expect(pass(StatusCodes.BAD_REQUEST, rule)).toBe(true)
    })

    test('失敗として指定されたコードの場合、falseを返すこと', () => {
      const rule = { failed: [StatusCodes.OK] }

      expect(pass(StatusCodes.OK, rule)).toBe(false)
    })

    test('成功と失敗に同じコードが指定された場合、falseを返すこと', () => {
      const rule = {
        success: [StatusCodes.BAD_REQUEST],
        failed: [StatusCodes.BAD_REQUEST],
      }

      expect(pass(StatusCodes.BAD_REQUEST, rule)).toBe(false)
    })

    test('指定がないコードの場合、基本判定を使用すること', () => {
      const rule = { success: [StatusCodes.BAD_REQUEST] }

      expect(pass(StatusCodes.OK, rule)).toBe(true)
      expect(pass(StatusCodes.INTERNAL_SERVER_ERROR, rule)).toBe(false)
    })

    test('関数がtrueを返す場合、trueを返すこと', () => {
      const rule = () => true

      expect(pass(StatusCodes.INTERNAL_SERVER_ERROR, rule)).toBe(true)
    })

    test('関数がfalseを返す場合、falseを返すこと', () => {
      const rule = () => false

      expect(pass(StatusCodes.OK, rule)).toBe(false)
    })
  })
})
