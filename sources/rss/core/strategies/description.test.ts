import { describe, test, expect } from 'vitest'

import { fromSnippet, fromSummary, fromContent } from './description'
import type { RawEntry } from '../models'

describe('description.ts', () => {
  describe('fromSnippet', () => {
    test('説明を取得すること', () => {
      const entry: RawEntry = {
        contentSnippet: 'This is a snippet',
      }

      expect(fromSnippet(entry)).toBe('This is a snippet')
    })

    test('説明がない場合、undefinedを返すこと', () => {
      const entry: RawEntry = {}

      expect(fromSnippet(entry)).toBeUndefined()
    })
  })

  describe('fromSummary', () => {
    test('説明を取得すること', () => {
      const entry: RawEntry = {
        summary: 'This is a summary',
      }

      expect(fromSummary(entry)).toBe('This is a summary')
    })

    test('説明がない場合、undefinedを返すこと', () => {
      const entry: RawEntry = {}

      expect(fromSummary(entry)).toBeUndefined()
    })
  })

  describe('fromContent', () => {
    test('優先度1の説明を取得すること', () => {
      const entry: RawEntry = {
        content: '<p>This is <strong>bold</strong> text</p>',
      }

      expect(fromContent(entry)).toBe('This is bold text')
    })

    test('優先度2の説明を取得すること', () => {
      const entry: RawEntry = {
        'content:encoded': '<div>Encoded <em>content</em></div>',
      }

      expect(fromContent(entry)).toBe('Encoded content')
    })

    test('ネストされたタグを除去して説明を取得すること', () => {
      const entry: RawEntry = {
        content: '<div class="container"><p style="color:red">Text</p><a href="#">Link</a></div>',
      }

      expect(fromContent(entry)).toBe('TextLink')
    })

    test('前後の空白を除去して説明を取得すること', () => {
      const entry: RawEntry = {
        content: '   <p>  Text with spaces  </p>   ',
      }

      expect(fromContent(entry)).toBe('Text with spaces')
    })

    test('説明がない場合、undefinedを返すこと', () => {
      const entry: RawEntry = {}

      expect(fromContent(entry)).toBeUndefined()
    })

    test('空文字の場合、undefinedを返すこと', () => {
      const entry: RawEntry = {
        content: '',
      }

      expect(fromContent(entry)).toBeUndefined()
    })

    test('タグのみの場合、undefinedを返すこと', () => {
      const entry: RawEntry = {
        content: '<p></p><div></div>',
      }

      expect(fromContent(entry)).toBeUndefined()
    })

    test('空白のみの場合、undefinedを返すこと', () => {
      const entry: RawEntry = {
        content: '   \n\t   ',
      }

      expect(fromContent(entry)).toBeUndefined()
    })
  })
})
