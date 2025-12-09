import { describe, test, expect, vi } from 'vitest'

import { provide } from './provider'

describe('provider.ts', () => {
  const methods = {
    useGet: vi.fn(),
    useInfinite: vi.fn(),
  }

  describe('provide', () => {
    test('生成時に関数が1回実行されること', () => {
      const builder = vi.fn(() => methods)

      provide(builder)()

      expect(builder).toHaveBeenCalledTimes(1)
      expect(builder).toHaveBeenCalledWith(
        expect.objectContaining({ get: expect.any(Function) }),
        expect.objectContaining({ useGet: expect.any(Function) }),
      )
    })

    test('拡張時に新しいインスタンスで再構築されること', () => {
      const builder = vi.fn(() => methods)

      const connector = provide(builder)()
      const base1 = builder.mock.calls.at(0)?.at(0)
      const base2 = builder.mock.calls.at(0)?.at(1)
      connector.extend({ timeout: 5000 })
      const extended1 = builder.mock.calls.at(1)?.at(0)
      const extended2 = builder.mock.calls.at(1)?.at(1)

      expect(builder).toHaveBeenCalledTimes(2)
      expect(extended1).not.toBe(base1)
      expect(extended2).not.toBe(base2)
    })
  })
})
