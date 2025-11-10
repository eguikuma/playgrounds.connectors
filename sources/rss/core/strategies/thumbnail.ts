import type { RawEntry } from '../models'

type MediaField = string | { $?: { url?: string } } | (string | { $?: { url?: string } })[]

const field = (value: MediaField | undefined): string | undefined => {
  if (!value) {
    return undefined
  }

  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value) && value.length > 0) {
    const first = value[0]

    if (typeof first === 'string') {
      return first
    }

    if (typeof first === 'object' && first?.$?.url) {
      return first.$.url
    }
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value.$?.url
  }

  return undefined
}

const html = (text: string): string =>
  text
    .replace(/&#(\d+);/g, (_, code) => {
      const point = Number.parseInt(code, 10)

      if (point < 32 || point === 127 || point > 0x10ffff) {
        return ''
      }

      return String.fromCodePoint(point)
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const point = Number.parseInt(hex, 16)

      if (point < 32 || point === 127 || point > 0x10ffff) {
        return ''
      }

      return String.fromCodePoint(point)
    })
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, '\u00A0')
    .replace(/&amp;/g, '&')

const absolute = (url: string, base?: string): string | undefined => {
  if (/^(file|javascript|vbscript):/i.test(url)) {
    return undefined
  }

  if (/^data:/i.test(url)) {
    if (/^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(url)) {
      return url
    }

    return undefined
  }

  if (/^https?:\/\//i.test(url)) {
    return url
  }

  if (!base) {
    return url
  }

  try {
    let result: string

    if (url.startsWith('//')) {
      const protocol = new URL(base).protocol
      result = `${protocol}${url}`
    } else {
      result = new URL(url, base).href
    }

    if (/^(file|javascript|vbscript|data):/i.test(result)) {
      return undefined
    }

    return result
  } catch {
    return url
  }
}

const image = (text: string, base?: string): string | undefined => {
  const pattern = /<img(?:\s[^>]{0,1999})?\ssrc\s*=\s*["']([^"']+)["']/i

  const match = text.match(pattern)

  if (match?.[1]) {
    let url: string | undefined = match[1]

    url = html(url)

    url = absolute(url, base)

    if (url?.trim()) {
      return url
    }
  }

  return undefined
}

export const fromEnclosure = (entry: RawEntry): string | undefined => entry.enclosure?.url

export const fromItunes = (entry: RawEntry): string | undefined => entry.itunesImage

export const fromMedia = (entry: RawEntry): string | undefined => {
  const thumbnail = field(entry.mediaThumbnail)
  if (thumbnail) {
    return thumbnail
  }

  const content = field(entry.mediaContent)
  if (content) {
    return content
  }

  if (entry.mediaGroup) {
    const thumbnails = entry.mediaGroup['media:thumbnail']

    if (Array.isArray(thumbnails) && thumbnails.length > 0) {
      const url = thumbnails[0]?.$?.url

      if (url) {
        return url
      }
    }

    const contents = entry.mediaGroup['media:content']

    if (Array.isArray(contents) && contents.length > 0) {
      const url = contents[0]?.$?.url
      if (url) {
        return url
      }
    }
  }

  return undefined
}

export const fromCustom = (entry: RawEntry): string | undefined => entry.image || entry.thumbnail

export const fromContent = (entry: RawEntry): string | undefined => {
  const text = entry.content || entry['content:encoded']

  if (!text) {
    return undefined
  }

  return image(text, entry.link)
}

export const fromSummary = (entry: RawEntry): string | undefined => {
  const text = entry.summary

  if (!text) {
    return undefined
  }

  return image(text, entry.link)
}
