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
