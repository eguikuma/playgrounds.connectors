import { getReasonPhrase, StatusCodes } from 'http-status-codes'

import type { Outcome } from '@outcomify/requestify'
import type { HttpRestStandaloneConnector } from '@outcomify/restify'

import type { HttpRssStandaloneGet, HttpRssStandaloneGetSource } from '../../models/get'
import type { Feed } from '../../services/parse/models/parsed'
import type { FeedParser } from '../../services/parse/parser'

export const createGet = <Base extends string>(
  http: HttpRestStandaloneConnector<Base>,
  parser: FeedParser,
): HttpRssStandaloneGet<Base> => {
  return async (source: HttpRssStandaloneGetSource<Base>): Promise<Outcome<Feed>> => {
    const response = await http.get<string>(source)

    if (!response.success) {
      return response
    }

    try {
      const feed = await parser.parse(response.data)

      return {
        success: true,
        status: response.status,
        data: feed,
      }
    } catch (thrown) {
      return {
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message:
          thrown instanceof Error
            ? thrown.message
            : getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      }
    }
  }
}
