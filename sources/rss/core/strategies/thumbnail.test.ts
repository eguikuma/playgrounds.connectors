import { describe, test, expect } from 'vitest'

import {
  fromEnclosure,
  fromItunes,
  fromMedia,
  fromCustom,
  fromContent,
  fromSummary,
} from './thumbnail'
import type { RawEntry } from '../models'

describe('thumbnail.ts', () => {
  describe('fromEnclosure', () => {
    test('サムネイルを取得すること', () => {
      const entry: RawEntry = {
        enclosure: { url: 'https://example.com/enclosure.jpg' },
      }

      expect(fromEnclosure(entry)).toBe('https://example.com/enclosure.jpg')
    })

    test('空オブジェクトの場合、undefinedを返すこと', () => {
      const entry: RawEntry = {
        enclosure: {} as RawEntry['enclosure'],
      }

      expect(fromEnclosure(entry)).toBeUndefined()
    })
  })

  describe('fromItunes', () => {
    test('サムネイルを取得すること', () => {
      const entry: RawEntry = {
        itunesImage: 'https://example.com/itunes.jpg',
      }

      expect(fromItunes(entry)).toBe('https://example.com/itunes.jpg')
    })
  })

  describe('fromMedia', () => {
    describe('mediaThumbnail', () => {
      test('オブジェクトからサムネイルを取得すること', () => {
        const entry: RawEntry = {
          mediaThumbnail: { $: { url: 'https://example.com/media-thumbnail-object.jpg' } },
        }

        expect(fromMedia(entry)).toBe('https://example.com/media-thumbnail-object.jpg')
      })

      test('文字列からサムネイルを取得すること', () => {
        const entry: RawEntry = {
          mediaThumbnail: 'https://example.com/media-thumbnail-string.jpg',
        }

        expect(fromMedia(entry)).toBe('https://example.com/media-thumbnail-string.jpg')
      })

      test('文字列配列から先頭のサムネイルを取得すること', () => {
        const entry: RawEntry = {
          mediaThumbnail: [
            'https://example.com/media-thumbnail-string-array-1.jpg',
            'https://example.com/media-thumbnail-string-array-2.jpg',
          ],
        }

        expect(fromMedia(entry)).toBe('https://example.com/media-thumbnail-string-array-1.jpg')
      })

      test('オブジェクト配列から先頭のサムネイルを取得すること', () => {
        const entry: RawEntry = {
          mediaThumbnail: [
            { $: { url: 'https://example.com/media-thumbnail-object-array-1.jpg' } },
            { $: { url: 'https://example.com/media-thumbnail-object-array-2.jpg' } },
          ],
        }

        expect(fromMedia(entry)).toBe('https://example.com/media-thumbnail-object-array-1.jpg')
      })
    })

    describe('mediaContent', () => {
      test('オブジェクトからサムネイルを取得すること', () => {
        const entry: RawEntry = {
          mediaContent: { $: { url: 'https://example.com/media-content-object.jpg' } },
        }

        expect(fromMedia(entry)).toBe('https://example.com/media-content-object.jpg')
      })

      test('文字列からサムネイルを取得すること', () => {
        const entry: RawEntry = {
          mediaContent: 'https://example.com/media-content-string.jpg',
        }

        expect(fromMedia(entry)).toBe('https://example.com/media-content-string.jpg')
      })

      test('文字列配列から先頭のサムネイルを取得すること', () => {
        const entry: RawEntry = {
          mediaContent: [
            'https://example.com/media-content-string-array-1.jpg',
            'https://example.com/media-content-string-array-2.jpg',
          ],
        }

        expect(fromMedia(entry)).toBe('https://example.com/media-content-string-array-1.jpg')
      })

      test('オブジェクト配列から先頭のサムネイルを取得すること', () => {
        const entry: RawEntry = {
          mediaContent: [
            { $: { url: 'https://example.com/media-content-object-array-1.jpg' } },
            { $: { url: 'https://example.com/media-content-object-array-2.jpg' } },
          ],
        }

        expect(fromMedia(entry)).toBe('https://example.com/media-content-object-array-1.jpg')
      })
    })

    describe('mediaGroup', () => {
      test('優先度1のサムネイルを取得すること', () => {
        const entry: RawEntry = {
          mediaGroup: {
            'media:thumbnail': [
              {
                $: {
                  url: 'https://i3.ytimg.com/vi/VIDEO_ID/hqdefault.jpg',
                  width: '480',
                  height: '360',
                },
              },
            ],
            'media:content': [
              {
                $: {
                  url: 'https://www.youtube.com/v/VIDEO_ID?version=3',
                  type: 'application/x-shockwave-flash',
                  width: '640',
                  height: '390',
                },
              },
            ],
          },
        }

        expect(fromMedia(entry)).toBe('https://i3.ytimg.com/vi/VIDEO_ID/hqdefault.jpg')
      })

      test('優先度2のサムネイルを取得すること', () => {
        const entry: RawEntry = {
          mediaGroup: {
            'media:content': [
              {
                $: {
                  url: 'https://example.com/media-group.jpg',
                  type: 'image/jpeg',
                },
              },
            ],
          },
        }

        expect(fromMedia(entry)).toBe('https://example.com/media-group.jpg')
      })
    })
  })

  describe('fromCustom', () => {
    test('優先度1のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        image: 'https://example.com/priority-1.jpg',
      }

      expect(fromCustom(entry)).toBe('https://example.com/priority-1.jpg')
    })

    test('優先度2のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        thumbnail: 'https://example.com/priority-2.jpg',
      }

      expect(fromCustom(entry)).toBe('https://example.com/priority-2.jpg')
    })
  })

  describe('fromContent', () => {
    test('優先度1のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        content:
          '<p>Text <img src="https://example.com/priority-1.jpg" alt="サムネイル"/> more text</p>',
      }

      expect(fromContent(entry)).toBe('https://example.com/priority-1.jpg')
    })

    test('優先度2のサムネイルを取得すること', () => {
      const entry: RawEntry = {
        'content:encoded': '<div><img src="https://example.com/priority-2.jpg"/></div>',
      }

      expect(fromContent(entry)).toBe('https://example.com/priority-2.jpg')
    })

    test('タグがない場合、undefinedを返すこと', () => {
      const entry: RawEntry = {
        content: '<p>Text without image</p>',
      }

      expect(fromContent(entry)).toBeUndefined()
    })

    test('複数タグがある場合、最初のサムネイルを抽出すること', () => {
      const entry: RawEntry = {
        content:
          '<div><img src="https://example.com/first.jpg"/><img src="https://example.com/second.jpg"/></div>',
      }

      expect(fromContent(entry)).toBe('https://example.com/first.jpg')
    })
  })

  describe('fromSummary', () => {
    test('サムネイルを取得すること', () => {
      const entry: RawEntry = {
        summary: '<p>Summary with <img src="https://example.com/summary.jpg"/> image</p>',
      }

      expect(fromSummary(entry)).toBe('https://example.com/summary.jpg')
    })

    test('タグがない場合、undefinedを返すこと', () => {
      const entry: RawEntry = {
        summary: '<p>Text without image</p>',
      }

      expect(fromSummary(entry)).toBeUndefined()
    })
  })

  describe('internals', () => {
    describe('decoding', () => {
      test('アンパサンドを含むURLをデコードすること', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?foo=bar&amp;baz=qux"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/image.jpg?foo=bar&baz=qux')
      })

      test('ダブルクォーテーションを含むURLをデコードすること', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?param=&quot;value&quot;"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/image.jpg?param="value"')
      })

      test('数値参照を含むURLをデコードすること', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?name=John&#39;s"/>',
        }

        expect(fromContent(entry)).toBe("https://example.com/image.jpg?name=John's")
      })

      test('16進数数値参照を含むURLをデコードすること', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?char=&#x27;test&#x27;"/>',
        }

        expect(fromContent(entry)).toBe("https://example.com/image.jpg?char='test'")
      })

      test('複数エンティティを含むURLをデコードすること', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?a=1&amp;b=2&amp;c=&#39;test&#39;"/>',
        }

        expect(fromContent(entry)).toBe("https://example.com/image.jpg?a=1&b=2&c='test'")
      })

      test('ノーブレークスペースをデコードすること', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?text=hello&nbsp;world"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/image.jpg?text=hello\u00A0world')
      })

      test('アポストロフィエンティティをデコードすること', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?name=John&apos;s"/>',
        }

        expect(fromContent(entry)).toBe("https://example.com/image.jpg?name=John's")
      })

      test('二重エンコードされた攻撃文字列を安全に処理すること', () => {
        const entry: RawEntry = {
          content:
            '<img src="https://example.com/image.jpg?text=&amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;"/>',
        }

        expect(fromContent(entry)).toBe(
          'https://example.com/image.jpg?text=&lt;script&gt;alert(1)&lt;/script&gt;',
        )
      })

      test('セミコロンなしエンティティの場合、そのまま返すこと', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?a=1&ampb=2"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/image.jpg?a=1&ampb=2')
      })

      test('10進数数値参照でゼロの場合、空文字列を返すこと', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?char=&#0;"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/image.jpg?char=')
      })

      test('16進数数値参照で最大Unicodeコードポイントの場合、変換すること', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?char=&#x10FFFF;"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/image.jpg?char=\u{10FFFF}')
      })

      test('16進数数値参照でUnicode範囲外の場合、空文字列を返すこと', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?char=&#x110000;"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/image.jpg?char=')
      })

      test('10進数数値参照でUnicode最大値を超える場合、空文字列を返すこと', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?char=&#1114112;"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/image.jpg?char=')
      })

      test('10進数数値参照で制御文字範囲の場合、空文字列を返すこと', () => {
        const entry1: RawEntry = {
          content: '<img src="https://example.com/image.jpg?char=&#9;"/>',
        }
        const entry2: RawEntry = {
          content: '<img src="https://example.com/image.jpg?char=&#10;"/>',
        }
        const entry3: RawEntry = {
          content: '<img src="https://example.com/image.jpg?char=&#13;"/>',
        }
        const entry4: RawEntry = {
          content: '<img src="https://example.com/image.jpg?char=&#31;"/>',
        }
        const entry5: RawEntry = {
          content: '<img src="https://example.com/image.jpg?char=&#127;"/>',
        }

        expect(fromContent(entry1)).toBe('https://example.com/image.jpg?char=')
        expect(fromContent(entry2)).toBe('https://example.com/image.jpg?char=')
        expect(fromContent(entry3)).toBe('https://example.com/image.jpg?char=')
        expect(fromContent(entry4)).toBe('https://example.com/image.jpg?char=')
        expect(fromContent(entry5)).toBe('https://example.com/image.jpg?char=')
      })

      test('10進数数値参照でサロゲートペア（絵文字）を変換すること', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?emoji=&#128512;"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/image.jpg?emoji=😀')
      })

      test('16進数数値参照でサロゲートペア（絵文字）を変換すること', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?emoji=&#x1F600;"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/image.jpg?emoji=😀')
      })

      test('10進数数値参照でタブ文字の場合、空文字列を返すこと', () => {
        const entry: RawEntry = {
          content: '<img src="https://example.com/image.jpg?tab=&#9;"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/image.jpg?tab=')
      })

      test('10進数数値参照で改行文字の場合、空文字列を返すこと', () => {
        const entry1: RawEntry = {
          content: '<img src="https://example.com/image.jpg?lf=&#10;"/>',
        }
        const entry2: RawEntry = {
          content: '<img src="https://example.com/image.jpg?cr=&#13;"/>',
        }

        expect(fromContent(entry1)).toBe('https://example.com/image.jpg?lf=')
        expect(fromContent(entry2)).toBe('https://example.com/image.jpg?cr=')
      })
    })

    describe('resolution', () => {
      test('相対URLを絶対URLに変換すること', () => {
        const entry: RawEntry = {
          link: 'https://example.com/article/123',
          content: '<img src="/images/thumbnail.jpg"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/images/thumbnail.jpg')
      })

      test('上位相対URLを絶対URLに変換すること', () => {
        const entry: RawEntry = {
          link: 'https://example.com/articles/2024/post',
          content: '<img src="../images/thumb.jpg"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/articles/images/thumb.jpg')
      })

      test('直下相対URLを絶対URLに変換すること', () => {
        const entry: RawEntry = {
          link: 'https://example.com/blog/article',
          content: '<img src="./images/photo.jpg"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/blog/images/photo.jpg')
      })

      test('プロトコル相対URLを絶対URLに変換すること', () => {
        const entry: RawEntry = {
          link: 'https://example.com/article',
          content: '<img src="//cdn.example.com/images/photo.jpg"/>',
        }

        expect(fromContent(entry)).toBe('https://cdn.example.com/images/photo.jpg')
      })

      test('基準URLがない場合、相対URLをそのまま返すこと', () => {
        const entry: RawEntry = {
          content: '<img src="/images/thumbnail.jpg"/>',
        }

        expect(fromContent(entry)).toBe('/images/thumbnail.jpg')
      })

      test('既に絶対URLの場合、そのまま返すこと', () => {
        const entry: RawEntry = {
          link: 'https://example.com/article',
          content: '<img src="https://cdn.example.com/image.jpg"/>',
        }

        expect(fromContent(entry)).toBe('https://cdn.example.com/image.jpg')
      })

      test('相対URLとエンティティの両方を処理すること', () => {
        const entry: RawEntry = {
          link: 'https://example.com/article',
          content: '<img src="/images/photo.jpg?param=value&amp;other=test"/>',
        }

        expect(fromContent(entry)).toBe(
          'https://example.com/images/photo.jpg?param=value&other=test',
        )
      })

      test('基準URLが不正な場合、元のURLをそのまま返すこと', () => {
        const entry: RawEntry = {
          link: 'not-a-valid-url',
          content: '<img src="/image.jpg"/>',
        }

        expect(fromContent(entry)).toBe('/image.jpg')
      })

      test('プロトコル相対URLで基準URLが不正な場合でも元のURLを返すこと', () => {
        const entry: RawEntry = {
          link: 'invalid-base',
          content: '<img src="//cdn.example.com/image.jpg"/>',
        }

        expect(fromContent(entry)).toBe('//cdn.example.com/image.jpg')
      })
    })

    describe('parsing', () => {
      const padded = (count: number) => {
        const overhead = 1 + 'data="'.length + '"'.length
        return `<img data="${'x'.repeat(Math.max(0, count - overhead))}" src="https://example.com/thumbnail.jpg" />`
      }

      test('ソース属性の前後に空白を含む場合でもサムネイルを抽出すること', () => {
        const entry: RawEntry = {
          content: '<img src = "https://example.com/whitespace.jpg"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/whitespace.jpg')
      })

      test('複数の属性を持つタグからサムネイルを抽出すること', () => {
        const entry: RawEntry = {
          content:
            '<img class="thumbnail" id="main-img" alt="サムネイル" src="https://example.com/complex.jpg" width="800"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/complex.jpg')
      })

      test('ソース属性が後ろにある場合でもサムネイルを抽出すること', () => {
        const entry: RawEntry = {
          content:
            '<img class="photo" alt="サムネイル" data-id="123" src="https://example.com/late-src.jpg"/>',
        }

        expect(fromContent(entry)).toBe('https://example.com/late-src.jpg')
      })

      test('500文字以上の長いデータ属性を持つタグからサムネイルを抽出すること', () => {
        const entry: RawEntry = {
          content: `<figure><img alt="サムネイル" data-caption="${'x'.repeat(500)}" data-portal-copyright="" src="https://example.com/long-attribute-image.jpg" /></figure>`,
        }

        expect(fromContent(entry)).toBe('https://example.com/long-attribute-image.jpg')
      })

      test('複数の長いデータ属性を持つタグからサムネイルを抽出すること', () => {
        const entry: RawEntry = {
          content: `<img alt="サムネイル" data-caption="${'x'.repeat(500)}" data-copyright="${'y'.repeat(500)}" data-author="${'z'.repeat(500)}" src="https://example.com/complex-image.jpg?quality=90" />`,
        }

        expect(fromContent(entry)).toBe('https://example.com/complex-image.jpg?quality=90')
      })

      test('2000文字ちょうどの属性を持つタグからサムネイルを抽出すること', () => {
        const entry: RawEntry = {
          content: padded(2000),
        }

        expect(fromContent(entry)).toBe('https://example.com/thumbnail.jpg')
      })

      test('2000文字を超える属性を持つタグの場合、サムネイルを抽出しないこと', () => {
        const entry: RawEntry = {
          content: padded(2001),
        }

        expect(fromContent(entry)).toBeUndefined()
      })

      test('1500文字の属性を持つタグからサムネイルを抽出すること', () => {
        const entry: RawEntry = {
          content: padded(1500),
        }

        expect(fromContent(entry)).toBe('https://example.com/thumbnail.jpg')
      })
    })

    describe('security', () => {
      describe('rejected', () => {
        test.each([
          ['javascript', 'javascript:alert(1)'],
          ['file', 'file:///etc/passwd'],
          ['data:svg', 'data:image/svg+xml,<svg></svg>'],
          ['data:html', 'data:text/html,<script>alert(1)</script>'],
          ['data:js', 'data:application/javascript,alert(1)'],
          ['data:png,notbase64', 'data:image/png,notbase64data'],
        ])('%sプロトコルの場合、undefinedを返すこと', (_, src) => {
          const entry: RawEntry = { content: `<img src="${src}"/>` }

          expect(fromContent(entry)).toBeUndefined()
        })
      })

      describe('allowed', () => {
        test.each([
          ['PNG', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg'],
          ['JPEG', 'data:image/jpeg;base64,/9j/4AAQSkZJRg'],
          ['GIF', 'data:image/gif;base64,R0lGODlhAQABAIAAAP'],
          ['WebP', 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4'],
        ])('%s形式のデータURIの場合、抽出すること', (_, src) => {
          const entry: RawEntry = { content: `<img src="${src}"/>` }

          expect(fromContent(entry)).toBe(src)
        })
      })
    })
  })
})
