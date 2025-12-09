import { describe, expect, test } from 'vitest'

import { chain } from './compose'

describe('compose.ts', () => {
  describe('chain', () => {
    test('両方の関数がある場合、順番に実行すること', () => {
      const called: number[] = []
      const parent = () => called.push(1)
      const child = () => called.push(2)

      chain(parent, child)?.()

      expect(called).toEqual([1, 2])
    })

    test('親のみの場合、親を返すこと', () => {
      const parent = () => 'parent'

      const chained = chain(parent, undefined)

      expect(chained).toBe(parent)
    })

    test('子のみの場合、子を返すこと', () => {
      const child = () => 'child'

      const chained = chain(undefined, child)

      expect(chained).toBe(child)
    })

    test('両方undefinedの場合、undefinedを返すこと', () => {
      const chained = chain(undefined, undefined)

      expect(chained).toBeUndefined()
    })
  })
})
