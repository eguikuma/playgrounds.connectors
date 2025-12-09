import type { Feed } from '@outcomify/rssify'

import { channel } from './channel'
import { rss } from '../integrations/standalone'

export const find = async (slug: string): Promise<Feed | null> => {
  const found = channel(slug)

  if (!found) {
    return null
  }

  const response = await rss.get(found.url)

  return response.success ? response.data : null
}
