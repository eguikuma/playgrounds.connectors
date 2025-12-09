import { describe, test, expect, vi } from 'vitest'

import { provide } from './provider'
import { FeedParser } from '../services/parse/parser'

describe('provider.ts', () => {
  const methods = {
    get: vi.fn(),
  }

  describe('provide', () => {
    test('生成時に関数が1回実行されること', () => {
      const builder = vi.fn(() => methods)

      provide(builder)()

      expect(builder).toHaveBeenCalledTimes(1)
      expect(builder).toHaveBeenCalledWith(
        expect.objectContaining({ get: expect.any(Function) }),
        expect.any(FeedParser),
      )
    })

    test('拡張時に新しいインスタンスで再構築されること', () => {
      const builder = vi.fn(() => methods)

      const connector = provide(builder)()
      const original = builder.mock.calls.at(0)?.at(0)
      connector.extend({ timeout: 5000 })
      const extended = builder.mock.calls.at(1)?.at(0)

      expect(builder).toHaveBeenCalledTimes(2)
      expect(extended).not.toBe(original)
    })
  })
})
