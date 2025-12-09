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
