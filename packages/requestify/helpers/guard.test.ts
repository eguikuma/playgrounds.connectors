import { describe, expect, test } from 'vitest'

import { has, isCancelled, isFunction, isNumber, isResponse, isString } from './guard'

describe('guard.ts', () => {
  describe('isFunction', () => {
    test('関数の場合、trueを返すこと', () => {
      expect(isFunction(() => Promise.resolve(new Response()))).toBe(true)
    })

    test('関数でない場合、falseを返すこと', () => {
      expect(isFunction('string')).toBe(false)
      expect(isFunction(123)).toBe(false)
      expect(isFunction(null)).toBe(false)
      expect(isFunction(undefined)).toBe(false)
      expect(isFunction({})).toBe(false)
    })
  })

  describe('isResponse', () => {
    test('レスポンスオブジェクトの場合、trueを返すこと', () => {
      expect(isResponse(new Response())).toBe(true)
    })

    test('レスポンスオブジェクトでない場合、falseを返すこと', () => {
      expect(isResponse('string')).toBe(false)
      expect(isResponse(123)).toBe(false)
      expect(isResponse(null)).toBe(false)
      expect(isResponse(undefined)).toBe(false)
      expect(isResponse({})).toBe(false)
    })
  })

  describe('isString', () => {
    test('文字列の場合、trueを返すこと', () => {
      expect(isString('string')).toBe(true)
    })

    test('文字列でない場合、falseを返すこと', () => {
      expect(isString(123)).toBe(false)
      expect(isString(null)).toBe(false)
      expect(isString(undefined)).toBe(false)
      expect(isString({})).toBe(false)
    })
  })

  describe('isNumber', () => {
    test('数値の場合、trueを返すこと', () => {
      expect(isNumber(123)).toBe(true)
      expect(isNumber(123.45)).toBe(true)
      expect(isNumber(-123)).toBe(true)
      expect(isNumber(-123.45)).toBe(true)
    })

    test('数値でない場合、falseを返すこと', () => {
      expect(isNumber(NaN)).toBe(false)
      expect(isNumber(Infinity)).toBe(false)
      expect(isNumber(-Infinity)).toBe(false)
      expect(isNumber('123.45')).toBe(false)
      expect(isNumber('')).toBe(false)
      expect(isNumber('123')).toBe(false)
      expect(isNumber(null)).toBe(false)
      expect(isNumber(undefined)).toBe(false)
      expect(isNumber({})).toBe(false)
    })
  })

  describe('isCancelled', () => {
    test('中断した場合、trueを返すこと', () => {
      expect(isCancelled(new DOMException('The operation was aborted', 'AbortError'))).toBe(true)
    })

    test('タイムアウトした場合、trueを返すこと', () => {
      expect(isCancelled(new DOMException('The operation timed out', 'TimeoutError'))).toBe(true)
    })

    test('その他のエラーの場合、falseを返すこと', () => {
      expect(isCancelled(new Error())).toBe(false)
    })
  })

  describe('has', () => {
    test('指定したプロパティを持つ場合、trueを返すこと', () => {
      expect(has('key')({ key: ['users'] })).toBe(true)
      expect(has('id')({ id: 1, name: 'some name' })).toBe(true)
    })

    test('指定したプロパティを持たない場合、falseを返すこと', () => {
      expect(has('key')({ other: 'value' })).toBe(false)
      expect(has('key')({})).toBe(false)
    })

    test('オブジェクトでない場合、falseを返すこと', () => {
      expect(has('key')(null)).toBe(false)
      expect(has('key')(undefined)).toBe(false)
      expect(has('key')('string')).toBe(false)
      expect(has('key')(123)).toBe(false)
      expect(has('key')([])).toBe(false)
    })
  })
})
