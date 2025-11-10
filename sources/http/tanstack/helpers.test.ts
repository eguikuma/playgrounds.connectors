import { describe, expect, test, vi } from 'vitest'

import type {
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query'

import { to } from './helpers'

describe('helpers.ts', () => {
  describe('to', () => {
    describe('query', () => {
      test('変換済みオブジェクトを返すこと', () => {
        const refetch = vi.fn()
        const original: Partial<UseQueryResult> = {
          isPending: false,
          isSuccess: true,
          isError: false,
          isFetching: false,
          isLoading: false,
          isRefetching: false,
          isStale: false,
          data: { id: 1, name: 'Converted Query' },
          error: null,
          status: 'success',
          refetch: refetch,
        }

        const converted = to.query(original as never)

        expect(converted.states.status).toBe('success')
        expect(converted.states.pending).toBe(false)
        expect(converted.states.success).toBe(true)
        expect(converted.states.failed).toBe(false)
        expect(converted.states.fetching).toBe(false)
        expect(converted.states.loading).toBe(false)
        expect(converted.states.refetching).toBe(false)
        expect(converted.states.stale).toBe(false)
        expect(converted.responses.success).toEqual({ id: 1, name: 'Converted Query' })
        expect(converted.responses.failed).toBe(null)
        expect(converted.handlers.refetch).toBe(refetch)
      })
    })

    describe('infinite', () => {
      test('変換済みオブジェクトを返すこと', () => {
        const refetch = vi.fn()
        const original: Partial<UseInfiniteQueryResult> = {
          isPending: false,
          isSuccess: true,
          isError: false,
          isFetching: false,
          isLoading: false,
          isRefetching: false,
          isFetchingNextPage: false,
          hasNextPage: true,
          isStale: false,
          data: { pages: [{ id: 1 }, { id: 2 }], pageParams: [0, 1] },
          error: null,
          status: 'success',
          fetchNextPage: vi.fn(),
          refetch: refetch,
        }

        const converted = to.infinite(original as never)

        expect(converted.states.status).toBe('success')
        expect(converted.states.pending).toBe(false)
        expect(converted.states.success).toBe(true)
        expect(converted.states.failed).toBe(false)
        expect(converted.states.fetching).toBe(false)
        expect(converted.states.loading).toBe(false)
        expect(converted.states.refetching).toBe(false)
        expect(converted.states.paging).toBe(false)
        expect(converted.states.more).toBe(true)
        expect(converted.states.stale).toBe(false)
        expect(converted.responses.success).toEqual([{ id: 1 }, { id: 2 }])
        expect(converted.responses.failed).toBe(null)
        expect(converted.handlers.refetch).toBe(refetch)
      })

      test('データが存在しない場合、空配列を返すこと', () => {
        const original: Partial<UseInfiniteQueryResult> = {
          isPending: false,
          isSuccess: true,
          isError: false,
          isFetching: false,
          isLoading: false,
          isRefetching: false,
          isFetchingNextPage: false,
          hasNextPage: false,
          isStale: false,
          data: undefined,
          error: null,
          status: 'success',
          fetchNextPage: vi.fn(),
          refetch: vi.fn(),
        }

        const converted = to.infinite(original as never)

        expect(converted.responses.success).toEqual([])
      })

      test('次ページが存在しない場合、ページ取得の関数は呼び出されないこと', () => {
        const next = vi.fn()
        const original: Partial<UseInfiniteQueryResult> = {
          isPending: false,
          isSuccess: true,
          isError: false,
          isFetching: false,
          isLoading: false,
          isRefetching: false,
          isFetchingNextPage: false,
          hasNextPage: false,
          isStale: false,
          data: { pages: [{ id: 1 }], pageParams: [0] },
          error: null,
          status: 'success',
          fetchNextPage: next,
          refetch: vi.fn(),
        }

        const converted = to.infinite(original as never)
        converted.handlers.next()

        expect(next).not.toHaveBeenCalled()
      })

      test('次ページを取得中の場合、ページ取得の関数は呼び出されないこと', () => {
        const next = vi.fn()
        const original: Partial<UseInfiniteQueryResult> = {
          isPending: true,
          isSuccess: false,
          isError: false,
          isFetching: true,
          isLoading: true,
          isRefetching: false,
          isFetchingNextPage: true,
          hasNextPage: true,
          isStale: false,
          data: undefined,
          error: null,
          status: 'pending',
          fetchNextPage: next,
          refetch: vi.fn(),
        }

        const converted = to.infinite(original as never)
        converted.handlers.next()

        expect(next).not.toHaveBeenCalled()
      })
    })

    describe('mutation', () => {
      test('変換済みオブジェクトを返すこと', async () => {
        const fire = vi.fn()
        const execute = vi.fn()
        const reset = vi.fn()
        const original: Partial<UseMutationResult> = {
          isPending: true,
          isSuccess: false,
          isError: false,
          isIdle: false,
          error: null,
          status: 'pending',
          mutate: fire,
          mutateAsync: execute,
          reset: reset,
        }

        const converted = to.mutation(original as never)

        expect(converted.states.status).toBe('pending')
        expect(converted.states.pending).toBe(true)
        expect(converted.states.success).toBe(false)
        expect(converted.states.failed).toBe(false)
        expect(converted.states.idle).toBe(false)
        expect(converted.responses.failed).toBe(null)
        expect(converted.handlers.fire).toBe(fire)
        await converted.handlers.execute({})
        expect(execute).toHaveBeenCalled()
        expect(converted.handlers.reset).toBe(reset)
      })
    })
  })
})
