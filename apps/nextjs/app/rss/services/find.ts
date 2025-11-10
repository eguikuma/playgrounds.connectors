'use server'

import type { Outcome } from '@connectors/http/core'
import type { Feed } from '@connectors/rss/core'
import { getReasonPhrase, StatusCodes } from 'http-status-codes'

import { channel } from './channel'
import { rss } from '../integrations/vanilla'

export const find = async (slug: string): Promise<Outcome<Feed>> => {
  const found = channel(slug)

  if (!found) {
    return {
      success: false,
      status: StatusCodes.NOT_FOUND,
      message: getReasonPhrase(StatusCodes.NOT_FOUND),
    }
  }

  const response = await rss.get(found.url)

  return response
}
