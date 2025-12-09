import { describe, test, expect } from 'vitest'

import { injector } from './injector'
import type { RequestContext } from '../models/request'

describe('injector.ts', () => {
  describe('headers', () => {
    test('同期的な場合、ヘッダーを追加すること', async () => {
      const interceptor = injector({
        headers: () => ({
          Authorization: 'The sync headers token',
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      const response = await interceptor(context)

      expect(response.options.headers).toEqual({
        Authorization: 'The sync headers token',
      })
    })

    test('非同期的な場合、ヘッダーを追加すること', async () => {
      const interceptor = injector({
        headers: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          return {
            Authorization: 'The async headers token',
          }
        },
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      const response = await interceptor(context)

      expect(response.options.headers).toEqual({
        Authorization: 'The async headers token',
      })
    })

    test('既存のヘッダーを保持しながら新しいヘッダーを追加すること', async () => {
      const interceptor = injector({
        headers: () => ({
          Authorization: 'The new token',
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      }

      const response = await interceptor(context)

      expect(response.options.headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'The new token',
      })
    })

    test('複数のヘッダーを一度に追加できること', async () => {
      const interceptor = injector({
        headers: () => ({
          Authorization: 'The multiple testcase token',
          'X-API-Key': 'The multiple testcase key',
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      const response = await interceptor(context)

      expect(response.options.headers).toEqual({
        Authorization: 'The multiple testcase token',
        'X-API-Key': 'The multiple testcase key',
      })
    })

    test('同じキーのヘッダーの場合、上書きされること', async () => {
      const interceptor = injector({
        headers: () => ({
          'Content-Type': 'text/plain',
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      }

      const response = await interceptor(context)

      expect(response.options.headers).toEqual({
        'Content-Type': 'text/plain',
      })
    })

    test('空のヘッダーを返す場合、既存のヘッダーのみ保持すること', async () => {
      const interceptor = injector({
        headers: () => ({}),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      }

      const response = await interceptor(context)

      expect(response.options.headers).toEqual({
        'Content-Type': 'application/json',
      })
    })

    test('同期的なハンドラー内で例外が発生した場合、エラーが伝播すること', async () => {
      const interceptor = injector({
        headers: () => {
          throw new Error('The sync headers was aborted')
        },
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      const response = interceptor(context)

      await expect(response).rejects.toThrow('The sync headers was aborted')
    })

    test('非同期的なハンドラー内で例外が発生した場合、エラーが伝播すること', async () => {
      const interceptor = injector({
        headers: async () => {
          throw new Error('The async headers was aborted')
        },
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      const response = interceptor(context)

      await expect(response).rejects.toThrow('The async headers was aborted')
    })

    test('空文字列の値の場合、そのまま設定されること', async () => {
      const interceptor = injector({
        headers: () => ({
          Authorization: '',
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      const response = await interceptor(context)

      expect(response.options.headers).toEqual({
        Authorization: '',
      })
    })

    test('非常に長い値の場合、そのまま設定されること', async () => {
      const long = `Bearer ${'a'.repeat(2000)}`
      const interceptor = injector({
        headers: () => ({
          Authorization: long,
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      const response = await interceptor(context)

      expect(response.options.headers).toEqual({
        Authorization: long,
      })
    })

    test('特殊文字を含む名前の場合、そのまま設定されること', async () => {
      const interceptor = injector({
        headers: () => ({
          'X-日本語': 'value',
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      const response = await interceptor(context)

      expect(response.options.headers).toEqual({
        'X-日本語': 'value',
      })
    })

    test('特殊文字を含む値の場合、そのまま設定されること', async () => {
      const interceptor = injector({
        headers: () => ({
          'X-Special': 'value with spaces, symbols: !@#$%',
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      const response = await interceptor(context)

      expect(response.options.headers).toEqual({
        'X-Special': 'value with spaces, symbols: !@#$%',
      })
    })

    test('大文字小文字が異なる同じ名前の場合、両方保持されること', async () => {
      const interceptor = injector({
        headers: () => ({
          'Content-Type': 'text/plain',
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {
          headers: {
            'content-type': 'application/json',
          },
        },
      }

      const response = await interceptor(context)

      expect(response.options.headers).toEqual({
        'content-type': 'application/json',
        'Content-Type': 'text/plain',
      })
    })

    test('ヘッダー以外の設定が保持されること', async () => {
      const interceptor = injector({
        headers: () => ({
          Authorization: 'The retained testcase token',
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {
          timeout: 5000,
          credentials: 'include',
          redirect: 'manual',
          localhost: false,
        },
      }

      const response = await interceptor(context)

      expect(response.options.timeout).toBe(5000)
      expect(response.options.credentials).toBe('include')
      expect(response.options.redirect).toBe('manual')
      expect(response.options.localhost).toBe(false)
    })

    test('複数のインスタンスが互いに干渉しないこと', async () => {
      const interceptor1 = injector({
        headers: () => ({
          'X-Client': 'App1',
        }),
      })
      const interceptor2 = injector({
        headers: () => ({
          'X-Client': 'App2',
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      const response1 = await interceptor1(context)
      const response2 = await interceptor2(context)

      expect(response1.options.headers).toEqual({ 'X-Client': 'App1' })
      expect(response2.options.headers).toEqual({ 'X-Client': 'App2' })
    })

    test('同じインターセプターを複数回適用した場合、正しく追加されること', async () => {
      const interceptor = injector({
        headers: () => ({
          'X-Injector': 'value',
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      const response1 = await interceptor(context)
      const response2 = await interceptor(response1)

      expect(response2.options.headers).toEqual({
        'X-Injector': 'value',
      })
    })

    test('非ASCII文字を含む値の場合、そのまま設定されること', async () => {
      const interceptor = injector({
        headers: () => ({
          'X-Japanese': '日本語テスト',
          'X-Emoji': '🚀',
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      const response = await interceptor(context)

      expect(response.options.headers).toEqual({
        'X-Japanese': '日本語テスト',
        'X-Emoji': '🚀',
      })
    })

    test('元のコンテキストが変更されないこと', async () => {
      const interceptor = injector({
        headers: () => ({
          Authorization: 'The immutable testcase token',
        }),
      })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      }
      const original = structuredClone(context)

      await interceptor(context)

      expect(context).toEqual(original)
    })
  })
})
