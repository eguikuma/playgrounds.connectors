import { describe, test, expect } from 'vitest'

import { create } from './connector'

describe('connector.ts', () => {
  describe('create', () => {
    test('クライアントを作成できること', () => {
      const connector = create()

      expect(connector.get).toBeInstanceOf(Function)
      expect(connector.post).toBeInstanceOf(Function)
      expect(connector.put).toBeInstanceOf(Function)
      expect(connector.patch).toBeInstanceOf(Function)
      expect(connector.delete).toBeInstanceOf(Function)
      expect(connector.extend).toBeInstanceOf(Function)
    })
  })
})
