import type { RawEntry } from '../models'

export const fromSnippet = (entry: RawEntry): string | undefined => entry.contentSnippet

export const fromSummary = (entry: RawEntry): string | undefined => entry.summary

export const fromContent = (entry: RawEntry): string | undefined => {
  const content = entry.content || entry['content:encoded']

  if (content) {
    const cleaned = content.replace(/<[^>]*>/g, '').trim()

    return cleaned || undefined
  }

  return undefined
}
