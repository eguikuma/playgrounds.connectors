import { describe, expect, test } from 'vitest'

import { assertHeaders, assertUrl } from './assert'
import { InvalidMetadataError, UnsafeUrlError } from './exception'

describe('assert.ts', () => {
  describe('assertUrl', () => {
    test('通常の接続を許可すること', () => {
      expect(() => assertUrl('http://example.com')).not.toThrow()
    })

    test('安全な接続を許可すること', () => {
      expect(() => assertUrl('https://example.com')).not.toThrow()
    })

    test('ファイル接続を拒否すること', () => {
      expect(() => assertUrl('file:///etc/passwd')).toThrow(UnsafeUrlError)
    })

    test('ファイル転送接続を拒否すること', () => {
      expect(() => assertUrl('ftp://example.com')).toThrow(UnsafeUrlError)
    })

    test('ローカル環境を拒否すること', () => {
      expect(() => assertUrl('http://localhost')).toThrow(UnsafeUrlError)
    })

    test('大文字のローカル環境も拒否すること', () => {
      expect(() => assertUrl('http://LOCALHOST')).toThrow(UnsafeUrlError)
    })

    test('10.x.x.xを拒否すること', () => {
      expect(() => assertUrl('http://10.0.0.1')).toThrow(UnsafeUrlError)
      expect(() => assertUrl('http://10.255.255.255')).toThrow(UnsafeUrlError)
    })

    test('172.16.x.x - 172.31.x.xを拒否すること', () => {
      expect(() => assertUrl('http://172.16.0.1')).toThrow(UnsafeUrlError)
      expect(() => assertUrl('http://172.31.255.255')).toThrow(UnsafeUrlError)
      expect(() => assertUrl('http://172.20.0.1')).toThrow(UnsafeUrlError)
    })

    test('172.15系のアドレスを許可すること', () => {
      expect(() => assertUrl('http://172.15.255.255')).not.toThrow()
    })

    test('172.32系のアドレスを許可すること', () => {
      expect(() => assertUrl('http://172.32.0.1')).not.toThrow()
    })

    test('192.168.x.xを拒否すること', () => {
      expect(() => assertUrl('http://192.168.0.1')).toThrow(UnsafeUrlError)
      expect(() => assertUrl('http://192.168.255.255')).toThrow(UnsafeUrlError)
    })

    test('127.x.x.xを拒否すること', () => {
      expect(() => assertUrl('http://127.0.0.1')).toThrow(UnsafeUrlError)
      expect(() => assertUrl('http://127.255.255.255')).toThrow(UnsafeUrlError)
    })

    test('169.254.x.xを拒否すること', () => {
      expect(() => assertUrl('http://169.254.0.1')).toThrow(UnsafeUrlError)
      expect(() => assertUrl('http://169.254.255.255')).toThrow(UnsafeUrlError)
    })

    test('0.x.x.xを拒否すること', () => {
      expect(() => assertUrl('http://0.0.0.0')).toThrow(UnsafeUrlError)
      expect(() => assertUrl('http://0.255.255.255')).toThrow(UnsafeUrlError)
    })

    test('8.8.8.8を許可すること', () => {
      expect(() => assertUrl('http://8.8.8.8')).not.toThrow()
    })

    test('1.1.1.1を許可すること', () => {
      expect(() => assertUrl('http://1.1.1.1')).not.toThrow()
    })

    test('93.184.216.34を許可すること', () => {
      expect(() => assertUrl('http://93.184.216.34')).not.toThrow()
    })

    test('ゼロ埋めされたアドレスを拒否すること', () => {
      expect(() => assertUrl('http://192.168.001.001')).toThrow(UnsafeUrlError)
      expect(() => assertUrl('http://127.000.000.001')).toThrow(UnsafeUrlError)
      expect(() => assertUrl('http://10.00.00.01')).toThrow(UnsafeUrlError)
    })

    test('範囲外の値を持つ第4版アドレスを拒否すること', () => {
      expect(() => assertUrl('http://192.168.1.256')).toThrow(UnsafeUrlError)
      expect(() => assertUrl('http://300.1.1.1')).toThrow(UnsafeUrlError)
      expect(() => assertUrl('http://1.1.1.999')).toThrow(UnsafeUrlError)
    })

    test('::1を拒否すること', () => {
      expect(() => assertUrl('http://[::1]')).toThrow(UnsafeUrlError)
    })

    test('::を拒否すること', () => {
      expect(() => assertUrl('http://[::]')).toThrow(UnsafeUrlError)
    })

    test('fe80::で始まるアドレスを拒否すること', () => {
      expect(() => assertUrl('http://[fe80::1]')).toThrow(UnsafeUrlError)
      expect(() => assertUrl('http://[fe80::abcd:1234]')).toThrow(UnsafeUrlError)
    })

    test('fcで始まるアドレスを拒否すること', () => {
      expect(() => assertUrl('http://[fc00::1]')).toThrow(UnsafeUrlError)
    })

    test('fdで始まるアドレスを拒否すること', () => {
      expect(() => assertUrl('http://[fd00::1]')).toThrow(UnsafeUrlError)
    })

    test('外部の次世代ネットワークアドレスを許可すること', () => {
      expect(() => assertUrl('http://[2001:4860:4860::8888]')).not.toThrow()
    })

    test('大文字を含む次世代ネットワークアドレスを正規化して検証すること', () => {
      expect(() => assertUrl('http://[2001:4860:4860::AAAA]')).not.toThrow()
      expect(() => assertUrl('http://[2001:DB8::1]')).not.toThrow()
      expect(() => assertUrl('http://[FE80::1]')).toThrow(UnsafeUrlError)
    })

    test('省略形の次世代ネットワークアドレスを許可すること', () => {
      expect(() => assertUrl('http://[2001:db8::1]')).not.toThrow()
      expect(() => assertUrl('http://[2001:db8:0:0:0:0:0:1]')).not.toThrow()
    })

    test('ポート番号付きの次世代ネットワークアドレスを許可すること', () => {
      expect(() => assertUrl('http://[2001:4860:4860::8888]:8080')).not.toThrow()
      expect(() => assertUrl('http://[::1]:3000', true)).not.toThrow()
    })

    test('正常なドメイン名を許可すること', () => {
      expect(() => assertUrl('https://example.com')).not.toThrow()
      expect(() => assertUrl('https://api.example.com')).not.toThrow()
    })

    test('ポート番号付きアドレスを許可すること', () => {
      expect(() => assertUrl('https://example.com:8080')).not.toThrow()
    })

    test('パス付きアドレスを許可すること', () => {
      expect(() => assertUrl('https://example.com/api/users')).not.toThrow()
    })

    test('クエリパラメータ付きアドレスを許可すること', () => {
      expect(() => assertUrl('https://example.com/api?key=value')).not.toThrow()
    })

    test('複数のスラッシュを含むパスを許可すること', () => {
      expect(() => assertUrl('https://example.com/api//users')).not.toThrow()
    })

    test('フラグメントを含むアドレスを許可すること', () => {
      expect(() => assertUrl('https://example.com/page#section')).not.toThrow()
    })

    test('unsafeの場合、ローカル環境を許可すること', () => {
      expect(() => assertUrl('http://localhost', true)).not.toThrow()
      expect(() => assertUrl('http://localhost:3000', true)).not.toThrow()
    })

    test('unsafeの場合、内部ネットワークを許可すること', () => {
      expect(() => assertUrl('http://127.0.0.1', true)).not.toThrow()
      expect(() => assertUrl('http://192.168.1.1', true)).not.toThrow()
      expect(() => assertUrl('http://10.0.0.1', true)).not.toThrow()
    })

    test('unsafeの場合、次世代プロトコルのループバックを許可すること', () => {
      expect(() => assertUrl('http://[::1]', true)).not.toThrow()
    })

    test('localhostパラメータの場合、次世代ネットワークのループバックを許可すること', () => {
      expect(() => assertUrl('http://[::1]', false, true)).not.toThrow()
    })

    test('unsafeでもファイル接続を拒否すること', () => {
      expect(() => assertUrl('file:///etc/passwd', true)).toThrow(UnsafeUrlError)
    })

    test('unsafeでもスクリプト実行を拒否すること', () => {
      expect(() => assertUrl('javascript:alert(1)', true)).toThrow(UnsafeUrlError)
    })

    test('unsafeでもデータ接続を拒否すること', () => {
      expect(() => assertUrl('data:text/html,<script>alert(1)</script>', true)).toThrow(
        UnsafeUrlError,
      )
    })

    test('unsafeでない場合、セキュリティチェックを実行すること', () => {
      expect(() => assertUrl('http://localhost', false)).toThrow(UnsafeUrlError)
    })

    test('unsafeが未指定の場合、セキュリティチェックを実行すること', () => {
      expect(() => assertUrl('http://localhost')).toThrow(UnsafeUrlError)
    })
  })

  describe('assertHeaders', () => {
    test('空の場合、エラーとならないこと', () => {
      expect(() => assertHeaders(new Headers())).not.toThrow()
    })

    test('ASCII文字のみの場合、エラーとならないこと', () => {
      expect(() => assertHeaders(new Headers({ key: 'value', name: 'test' }))).not.toThrow()
    })

    test('ISO-8859-1の範囲内の文字の場合、エラーとならないこと', () => {
      expect(() => assertHeaders(new Headers({ header: 'àéîöü' }))).not.toThrow()
    })

    test('境界値（=255）の場合、エラーとならないこと', () => {
      const char255 = String.fromCharCode(255)

      expect(() => assertHeaders(new Headers({ header: char255 }))).not.toThrow()
    })

    test('境界値（=32、=126）の場合、エラーとならないこと', () => {
      expect(() => assertHeaders(new Headers({ header: ' ' }))).not.toThrow()
      expect(() => assertHeaders(new Headers({ header: '~' }))).not.toThrow()
    })

    test('制御文字の場合、エラーとなること', () => {
      expect(() => assertHeaders(new Headers({ header: String.fromCharCode(0) }))).toThrow(
        InvalidMetadataError,
      )
      expect(() => assertHeaders(new Headers({ header: String.fromCharCode(9) }))).toThrow(
        InvalidMetadataError,
      )
      expect(() => assertHeaders(new Headers({ header: String.fromCharCode(10) }))).toThrow(
        InvalidMetadataError,
      )
      expect(() => assertHeaders(new Headers({ header: String.fromCharCode(31) }))).toThrow(
        InvalidMetadataError,
      )
      expect(() => assertHeaders(new Headers({ header: String.fromCharCode(127) }))).toThrow(
        InvalidMetadataError,
      )
    })

    test('境界値（=256）の場合、エラーとなること', () => {
      const char256 = String.fromCharCode(256)

      expect(() => assertHeaders(new Headers({ header: char256 }))).toThrow(InvalidMetadataError)
    })

    test('日本語文字の場合、エラーとなること', () => {
      expect(() => assertHeaders(new Headers({ header: 'テスト' }))).toThrow(InvalidMetadataError)
    })

    test('絵文字の場合、エラーとなること', () => {
      expect(() => assertHeaders(new Headers({ header: '🎉' }))).toThrow(InvalidMetadataError)
    })

    test('複数の値があり全て有効な場合、エラーとならないこと', () => {
      expect(() =>
        assertHeaders(
          new Headers({
            key1: 'value1',
            key2: 'value2',
            key3: 'test',
          }),
        ),
      ).not.toThrow()
    })

    test('複数の値があり一つでも無効な場合、エラーとなること', () => {
      expect(() =>
        assertHeaders(
          new Headers({
            key1: 'value1',
            key2: 'テスト',
            key3: 'test',
          }),
        ),
      ).toThrow(InvalidMetadataError)
    })
  })
})
