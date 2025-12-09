import { describe, test, expect } from 'vitest'

import { fromIso, fromPub } from './published'
import type { RawEntry } from '../models/raw'

describe('published.ts', () => {
  describe('fromIso', () => {
    test('日付を取得すること', () => {
      const entry: RawEntry = {
        isoDate: '2024-01-01T00:00:00.000Z',
      }

      const response = fromIso(entry)

      expect(response).toBeInstanceOf(Date)
      expect(response?.toISOString()).toBe('2024-01-01T00:00:00.000Z')
    })

    test('日付がない場合、undefinedを返すこと', () => {
      const entry: RawEntry = {}

      expect(fromIso(entry)).toBeUndefined()
    })

    test('空文字の場合、undefinedを返すこと', () => {
      const entry: RawEntry = {
        isoDate: '',
      }

      expect(fromIso(entry)).toBeUndefined()
    })

    test('空白のみの場合、undefinedを返すこと', () => {
      const entry: RawEntry = {
        isoDate: '   \n\t   ',
      }

      expect(fromIso(entry)).toBeUndefined()
    })

    test('範囲外の月を含む日付の場合、undefinedを返すこと', () => {
      const entry: RawEntry = {
        isoDate: '2024-13-01T00:00:00.000Z',
      }

      expect(fromIso(entry)).toBeUndefined()
    })

    test('範囲外の日を含む日付の場合、undefinedを返すこと', () => {
      const entry: RawEntry = {
        isoDate: '2024-01-32T00:00:00.000Z',
      }

      expect(fromIso(entry)).toBeUndefined()
    })
  })

  describe('fromPub', () => {
    test('日付を取得すること', () => {
      const entry: RawEntry = {
        pubDate: 'Mon, 01 Jan 2024 00:00:00 GMT',
      }

      const response = fromPub(entry)

      expect(response).toBeInstanceOf(Date)
      expect(response?.toISOString()).toBe('2024-01-01T00:00:00.000Z')
    })

    test('日付がない場合、undefinedを返すこと', () => {
      const entry: RawEntry = {}

      expect(fromPub(entry)).toBeUndefined()
    })

    test('不正なpubDateの場合、undefinedを返すこと', () => {
      const entry: RawEntry = {
        pubDate: 'not a valid date',
      }

      expect(fromPub(entry)).toBeUndefined()
    })

    test('空白のみの場合、undefinedを返すこと', () => {
      const entry: RawEntry = {
        pubDate: '   \n\t   ',
      }

      expect(fromPub(entry)).toBeUndefined()
    })
  })
})
