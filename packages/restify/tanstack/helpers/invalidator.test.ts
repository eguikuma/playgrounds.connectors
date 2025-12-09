import { afterEach, describe, expect, test } from 'vitest'

import { staleness, timestamps } from './invalidator'

describe('invalidator.ts', () => {
  afterEach(() => {
    timestamps.clear()
  })

  describe('timestamps.mark', () => {
    test('タイムスタンプを保存すること', () => {
      const before = Date.now()
      timestamps.mark(['stored'])
      const after = Date.now()

      const found = timestamps.find(['stored'])
      expect(found.timestamp).toBeGreaterThanOrEqual(before)
      expect(found.timestamp).toBeLessThanOrEqual(after)
    })

    test('同じキーで上書きすること', () => {
      timestamps.mark(['overwrite'])
      const first = timestamps.find(['overwrite'])
      timestamps.mark(['overwrite'])
      const second = timestamps.find(['overwrite'])

      expect(second.timestamp).toBeGreaterThanOrEqual(first.timestamp)
    })
  })

  describe('timestamps.find', () => {
    test('完全一致でタイムスタンプとキーを返すこと', () => {
      timestamps.mark(['exact-match'])

      const found = timestamps.find(['exact-match'])

      expect(found.timestamp).toBeGreaterThan(0)
      expect(found.matched).toBe('["exact-match"]')
    })

    test('プレフィックス一致でタイムスタンプとキーを返すこと', () => {
      timestamps.mark(['prefix-match'])

      const found = timestamps.find(['prefix-match', 'page', 1])

      expect(found.timestamp).toBeGreaterThan(0)
      expect(found.matched).toBe('["prefix-match"]')
    })

    test('複数要素のプレフィックス一致でタイムスタンプとキーを返すこと', () => {
      timestamps.mark(['prefix', 'match'])

      const found = timestamps.find(['prefix', 'match', 'page', 1])

      expect(found.timestamp).toBeGreaterThan(0)
      expect(found.matched).toBe('["prefix","match"]')
    })

    test('一致しない場合はタイムスタンプ0を返すこと', () => {
      timestamps.mark(['actually-key'])

      const found = timestamps.find(['mismatch-key'])

      expect(found.timestamp).toBe(0)
      expect(found.matched).toBeUndefined()
    })

    test('空のストアでタイムスタンプ0を返すこと', () => {
      const found = timestamps.find(['empty'])

      expect(found.timestamp).toBe(0)
      expect(found.matched).toBeUndefined()
    })

    test('部分一致しない場合はタイムスタンプ0を返すこと', () => {
      timestamps.mark(['partial', 'match'])

      const found = timestamps.find(['partial', 'mismatch'])

      expect(found.timestamp).toBe(0)
    })

    test('数値プレフィックスで誤マッチしないこと', () => {
      timestamps.mark(['users', 1])

      expect(timestamps.find(['users', 10]).timestamp).toBe(0)
      expect(timestamps.find(['users', 100]).timestamp).toBe(0)
      expect(timestamps.find(['users', 1]).timestamp).toBeGreaterThan(0)
    })

    test('空配列で誤マッチしないこと', () => {
      timestamps.mark([])

      expect(timestamps.find(['anything']).timestamp).toBe(0)
    })
  })

  describe('timestamps.remove', () => {
    test('指定したキーを削除すること', () => {
      timestamps.mark(['to-remove'])
      const before = timestamps.find(['to-remove'])

      timestamps.remove(before.matched ?? '')

      const after = timestamps.find(['to-remove'])
      expect(after.timestamp).toBe(0)
    })
  })

  describe('timestamps.clear', () => {
    test('全てのタイムスタンプをクリアすること', () => {
      timestamps.mark(['timestamp-1'])
      timestamps.mark(['timestamp-2'])

      timestamps.clear()

      expect(timestamps.find(['timestamp-1']).timestamp).toBe(0)
      expect(timestamps.find(['timestamp-2']).timestamp).toBe(0)
    })
  })

  describe('staleness', () => {
    test('タイムスタンプがデータ更新日時より新しい場合、0を返すこと', () => {
      timestamps.mark(['stale-key'])

      const stale = staleness(['stale-key'], 1000)
      const timestamp = stale({ state: { dataUpdatedAt: 0 } })

      expect(timestamp).toBe(0)
    })

    test('タイムスタンプがデータ更新日時より古い場合、指定値を返すこと', () => {
      timestamps.mark(['fresh-key'])
      const found = timestamps.find(['fresh-key'])

      const stale = staleness(['fresh-key'], 1000)
      const timestamp = stale({ state: { dataUpdatedAt: found.timestamp + 1000 } })

      expect(timestamp).toBe(1000)
    })

    test('再取得後に完全一致のタイムスタンプを削除すること', () => {
      timestamps.mark(['cleanup-key'])
      const found = timestamps.find(['cleanup-key'])

      const stale = staleness(['cleanup-key'], 1000)
      stale({ state: { dataUpdatedAt: found.timestamp + 1000 } })

      const after = timestamps.find(['cleanup-key'])
      expect(after.timestamp).toBe(0)
    })

    test('プレフィックス一致の場合、タイムスタンプを削除しないこと', () => {
      timestamps.mark(['prefix-key'])
      const found = timestamps.find(['prefix-key'])

      const stale = staleness(['prefix-key', 'additional'], 1000)
      stale({ state: { dataUpdatedAt: found.timestamp + 1000 } })

      const after = timestamps.find(['prefix-key'])
      expect(after.timestamp).toBeGreaterThan(0)
    })

    test('タイムスタンプがない場合、指定値を返すこと', () => {
      const stale = staleness(['no-timestamp'], 1000)
      const timestamp = stale({ state: { dataUpdatedAt: Date.now() } })

      expect(timestamp).toBe(1000)
    })

    test('指定値が関数の場合、関数を実行すること', () => {
      const stale = staleness(['function-key'], () => 2000)
      const timestamp = stale({ state: { dataUpdatedAt: Date.now() } })

      expect(timestamp).toBe(2000)
    })

    test('指定値がundefinedの場合、0を返すこと', () => {
      const stale = staleness(['undefined-key'], undefined)
      const timestamp = stale({ state: { dataUpdatedAt: Date.now() } })

      expect(timestamp).toBe(0)
    })
  })
})
