import { describe, expect, test } from 'vitest'

import { mixin } from './extend'
import type { GlobalOptions } from '../models/options'

describe('extend.ts', () => {
  describe('mixin', () => {
    test('optionsが未指定の場合、defaultsを返すこと', () => {
      const defaults = { base: 'https://example.com', timeout: 5000 }

      const mixed = mixin(undefined, defaults)

      expect(mixed).toEqual({
        base: 'https://example.com',
        timeout: 5000,
        headers: {},
      })
    })

    test('defaultsが空の場合、optionsを返すこと', () => {
      const options: Partial<GlobalOptions> = { base: 'https://api.example.com', unsafe: true }

      const mixed = mixin(options, {})

      expect(mixed).toEqual({
        base: 'https://api.example.com',
        unsafe: true,
        headers: {},
      })
    })

    test('optionsがdefaultsを上書きすること', () => {
      const defaults = { base: 'https://example.com', timeout: 5000 }
      const options: Partial<GlobalOptions> = { base: 'https://api.example.com', localhost: true }

      const mixed = mixin(options, defaults)

      expect(mixed).toEqual({
        base: 'https://api.example.com',
        timeout: 5000,
        localhost: true,
        headers: {},
      })
    })

    test('双方にヘッダーがある場合、マージすること', () => {
      const defaults = { headers: { 'X-Default': 'default' } }
      const options = { headers: { 'X-Option': 'option' } }

      const mixed = mixin(options, defaults)

      expect(mixed.headers).toEqual({
        'X-Default': 'default',
        'X-Option': 'option',
      })
    })

    test('optionsのヘッダーがdefaultsを上書きすること', () => {
      const defaults = { headers: { 'X-Key': 'default' } }
      const options = { headers: { 'X-Key': 'override' } }

      const mixed = mixin(options, defaults)

      expect(mixed.headers).toEqual({ 'X-Key': 'override' })
    })

    test('defaultsのみにヘッダーがある場合、defaultsのヘッダーを使用すること', () => {
      const defaults = { headers: { 'X-Default': 'value' } }
      const options: Partial<GlobalOptions> = { base: 'https://example.com' }

      const mixed = mixin(options, defaults)

      expect(mixed.headers).toEqual({ 'X-Default': 'value' })
    })

    test('optionsのみにヘッダーがある場合、optionsのヘッダーを使用すること', () => {
      const defaults = { base: 'https://example.com' }
      const options = { headers: { 'X-Option': 'value' } }

      const mixed = mixin(options, defaults)

      expect(mixed.headers).toEqual({ 'X-Option': 'value' })
    })

    test('Headersオブジェクトをマージすること', () => {
      const defaults = { headers: new Headers({ 'X-Default-Object': 'default-object' }) }
      const options = { headers: new Headers({ 'X-Option-Object': 'option-object' }) }

      const mixed = mixin(options, defaults)

      expect(mixed.headers).toEqual({
        'X-Default-Object': 'default-object',
        'X-Option-Object': 'option-object',
      })
    })

    test('配列形式のヘッダーをマージすること', () => {
      const defaults = { headers: new Headers([['X-Default-Array', 'default-array']]) }
      const options = { headers: new Headers([['X-Option-Array', 'option-array']]) }

      const mixed = mixin(options, defaults)

      expect(mixed.headers).toEqual({
        'X-Default-Array': 'default-array',
        'X-Option-Array': 'option-array',
      })
    })
  })
})
