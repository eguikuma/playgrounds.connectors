import type Parser from 'rss-parser'

export type Fields = {
  'content:encoded'?: string
  mediaThumbnail?:
    | string
    | {
        $?: {
          url?: string
        }
      }
    | (
        | string
        | {
            $?: {
              url?: string
            }
          }
      )[]
  mediaContent?:
    | string
    | {
        $?: {
          url?: string
        }
      }
    | (
        | string
        | {
            $?: {
              url?: string
            }
          }
      )[]
  mediaGroup?: {
    'media:thumbnail'?: {
      $?: {
        url?: string
        width?: string
        height?: string
      }
    }[]
    'media:content'?: {
      $?: {
        url?: string
        type?: string
        width?: string
        height?: string
      }
    }[]
  }
  itunesImage?: string
  image?: string
  thumbnail?: string
}

export type RawEntry = Parser.Item & Fields

export type RawFeed = Parser.Output<Fields>

export type Entry = {
  identifier?: string
  title?: string
  description?: string
  link?: string
  thumbnail?: string
  published?: Date
  creator?: string
  categories?: string[]
  snippet?: string
}

export type Feed = {
  title?: string
  link?: string
  description?: string
  entries: Entry[]
}

export type PagedFeed = {
  total: number
  next?: number
  entries: Entry[]
}
