import { describe, test, expect } from 'vitest'

import { create } from './connector'

describe('connector.ts', () => {
  describe('create', () => {
    test('全てのメソッドを返すこと', () => {
      const connector = create()

      expect(connector.get).toBeInstanceOf(Function)
      expect(connector.extend).toBeInstanceOf(Function)
    })
  })
})
