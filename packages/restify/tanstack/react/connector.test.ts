import { describe, test, expect } from 'vitest'

import { create } from './connector'

describe('connector.ts', () => {
  describe('create', () => {
    test('クライアントを作成できること', () => {
      const connector = create()

      expect(connector.useGet).toBeInstanceOf(Function)
      expect(connector.useInfinite).toBeInstanceOf(Function)
      expect(connector.usePost).toBeInstanceOf(Function)
      expect(connector.usePut).toBeInstanceOf(Function)
      expect(connector.usePatch).toBeInstanceOf(Function)
      expect(connector.useDelete).toBeInstanceOf(Function)
      expect(connector.extend).toBeInstanceOf(Function)
    })
  })
})
