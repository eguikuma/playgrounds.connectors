import { describe, expect, test } from 'vitest'

import { attempt } from './resolve'
import type { RawEntry } from '../models/raw'

describe('resolve.ts', () => {
  describe('attempt', () => {
    test('空の戦略配列の場合、undefinedを返すこと', () => {
      const entry: RawEntry = { title: 'Empty Strategies' }

      const attempted = attempt(entry, [])

      expect(attempted).toBeUndefined()
    })

    test('全ての戦略がundefinedを返す場合、undefinedを返すこと', () => {
      const entry: RawEntry = { title: 'Only Undefined Strategies' }
      const strategies = [() => undefined, () => undefined, () => undefined]

      const attempted = attempt(entry, strategies)

      expect(attempted).toBeUndefined()
    })

    test('最初の戦略が成功した場合、その結果を返すこと', () => {
      const entry: RawEntry = { title: 'Prioritize First' }
      const strategies = [() => 'first', () => 'second', () => 'third']

      const attempted = attempt(entry, strategies)

      expect(attempted).toBe('first')
    })

    test('2番目の戦略が成功した場合、その結果を返すこと', () => {
      const entry: RawEntry = { title: 'Prioritize Second' }
      const strategies = [() => undefined, () => 'second', () => 'third']

      const attempted = attempt(entry, strategies)

      expect(attempted).toBe('second')
    })

    test('最後の戦略が成功した場合、その結果を返すこと', () => {
      const entry: RawEntry = { title: 'Prioritize Last' }
      const strategies = [() => undefined, () => undefined, () => 'third']

      const attempted = attempt(entry, strategies)

      expect(attempted).toBe('third')
    })

    test('nullを返す戦略の場合、nullを返すこと', () => {
      const entry: RawEntry = { title: 'Intentionally Return Null' }
      const strategies = [() => undefined, () => null, () => 'fallback']

      const attempted = attempt(entry, strategies)

      expect(attempted).toBeNull()
    })
  })
})
