import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { describe, test, expect, vi } from 'vitest'

import { monitor } from './monitor'
import type { RequestContext } from '../models/request'
import type { ResponseContext } from '../models/response'

describe('monitor.ts', () => {
  describe('requested', () => {
    test('ハンドラーにコンテキストを渡すこと', () => {
      const observer = vi.fn()
      const interceptor = monitor.requested({ observer })
      const context: RequestContext = {
        method: 'POST',
        endpoint: '/api/users',
        options: {
          headers: { 'Content-Type': 'application/json' },
        },
        body: { name: 'test' },
      }

      interceptor(context)

      expect(observer).toHaveBeenCalledWith({
        kind: 'request',
        method: 'POST',
        endpoint: '/api/users',
        options: {
          headers: { 'Content-Type': 'application/json' },
        },
        body: { name: 'test' },
      })
    })

    test('コンテキストを変更せずに返すこと', () => {
      const observer = vi.fn()
      const interceptor = monitor.requested({ observer })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      const response = interceptor(context)

      expect(response).toBe(context)
    })

    test('ハンドラー内で例外が発生した場合、エラーが伝播すること', () => {
      const error = new Error('The observe was aborted')
      const observer = vi.fn(() => {
        throw error
      })
      const interceptor = monitor.requested({ observer })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      expect(() => interceptor(context)).toThrow(error)
    })

    test('ハンドラーが1回だけ呼ばれること', () => {
      const observer = vi.fn()
      const interceptor = monitor.requested({ observer })
      const context: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }

      interceptor(context)

      expect(observer).toHaveBeenCalledTimes(1)
    })

    test('複数のインスタンスが互いに干渉しないこと', () => {
      const observer1 = vi.fn()
      const observer2 = vi.fn()
      const interceptor1 = monitor.requested({ observer: observer1 })
      const interceptor2 = monitor.requested({ observer: observer2 })
      const context1: RequestContext = {
        method: 'GET',
        endpoint: '/api/users',
        options: {},
      }
      const context2: RequestContext = {
        method: 'POST',
        endpoint: '/api/posts',
        options: {},
        body: { title: 'test' },
      }

      interceptor1(context1)
      interceptor2(context2)

      expect(observer1).toHaveBeenCalledTimes(1)
      expect(observer1).toHaveBeenCalledWith({
        kind: 'request',
        method: 'GET',
        endpoint: '/api/users',
        options: {},
        body: undefined,
      })
      expect(observer2).toHaveBeenCalledTimes(1)
      expect(observer2).toHaveBeenCalledWith({
        kind: 'request',
        method: 'POST',
        endpoint: '/api/posts',
        options: {},
        body: { title: 'test' },
      })
    })
  })

  describe('responded', () => {
    test('ハンドラーにコンテキストを渡すこと', () => {
      const observer = vi.fn()
      const interceptor = monitor.responded({ observer })
      const context: ResponseContext = {
        method: 'GET',
        endpoint: '/api/users',
        outcome: {
          success: true,
          status: StatusCodes.OK,
          data: { id: 1 },
        },
        raw: new Response(JSON.stringify({ id: 1 }), {
          status: StatusCodes.OK,
        }),
      }

      const response = interceptor(context)

      expect(observer).toHaveBeenCalledWith({
        kind: 'response',
        method: 'GET',
        endpoint: '/api/users',
        status: StatusCodes.OK,
        data: { id: 1 },
      })
      expect(response).toEqual(context)
    })

    test('コンテキストを変更せずに返すこと', () => {
      const observer = vi.fn()
      const interceptor = monitor.responded({ observer })
      const context: ResponseContext = {
        method: 'POST',
        endpoint: '/api/posts',
        outcome: {
          success: true,
          status: StatusCodes.OK,
          data: getReasonPhrase(StatusCodes.OK),
        },
        raw: new Response(JSON.stringify({}), {
          status: StatusCodes.OK,
        }),
      }

      const response = interceptor(context)

      expect(response).toBe(context)
    })

    test('ハンドラー内で例外が発生した場合、エラーが伝播すること', () => {
      const error = new Error('Observer failed')
      const observer = vi.fn(() => {
        throw error
      })
      const interceptor = monitor.responded({ observer })
      const context: ResponseContext = {
        method: 'GET',
        endpoint: '/api/users',
        outcome: {
          success: true,
          status: StatusCodes.OK,
          data: { id: 1 },
        },
        raw: new Response(JSON.stringify({ id: 1 }), {
          status: StatusCodes.OK,
        }),
      }

      expect(() => interceptor(context)).toThrow(error)
    })

    test('ハンドラーが1回だけ呼ばれること', () => {
      const observer = vi.fn()
      const interceptor = monitor.responded({ observer })
      const context: ResponseContext = {
        method: 'GET',
        endpoint: '/api/users',
        outcome: {
          success: true,
          status: StatusCodes.OK,
          data: { id: 1 },
        },
        raw: new Response(JSON.stringify({ id: 1 }), {
          status: StatusCodes.OK,
        }),
      }

      interceptor(context)

      expect(observer).toHaveBeenCalledTimes(1)
    })

    test('複数のインスタンスが互いに干渉しないこと', () => {
      const observer1 = vi.fn()
      const observer2 = vi.fn()
      const interceptor1 = monitor.responded({ observer: observer1 })
      const interceptor2 = monitor.responded({ observer: observer2 })
      const context1: ResponseContext = {
        method: 'GET',
        endpoint: '/api/users/1',
        outcome: {
          success: true,
          status: StatusCodes.OK,
          data: { id: 1 },
        },
        raw: new Response(JSON.stringify({ id: 1 }), {
          status: StatusCodes.OK,
        }),
      }
      const context2: ResponseContext = {
        method: 'POST',
        endpoint: '/api/users',
        outcome: {
          success: true,
          status: StatusCodes.CREATED,
          data: { id: 2 },
        },
        raw: new Response(JSON.stringify({ id: 2 }), {
          status: StatusCodes.CREATED,
        }),
      }

      interceptor1(context1)
      interceptor2(context2)

      expect(observer1).toHaveBeenCalledTimes(1)
      expect(observer1).toHaveBeenCalledWith({
        kind: 'response',
        method: 'GET',
        endpoint: '/api/users/1',
        status: StatusCodes.OK,
        data: { id: 1 },
      })
      expect(observer2).toHaveBeenCalledTimes(1)
      expect(observer2).toHaveBeenCalledWith({
        kind: 'response',
        method: 'POST',
        endpoint: '/api/users',
        status: StatusCodes.CREATED,
        data: { id: 2 },
      })
    })
  })
})
