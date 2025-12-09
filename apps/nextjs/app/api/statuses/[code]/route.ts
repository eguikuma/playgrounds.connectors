import { type NextRequest, NextResponse } from 'next/server'

import { getReasonPhrase, StatusCodes } from 'http-status-codes'

import { isNative } from '@kit/predicates/exception'
import { between, equal, greaterThan, lessThan } from '@kit/predicates/number'

const handler = async (request: NextRequest, context: RouteContext<'/api/statuses/[code]'>) => {
  const id = request.headers.has('X-Client-Request')
    ? `client:${request.headers.get('X-Client-Request')}`
    : request.headers.get('X-Server-Request')
      ? `server:${request.headers.get('X-Server-Request')}`
      : 'unknown'
  const code = Number((await context.params).code)
  const timestamp = new Date().toISOString()

  try {
    if (
      Number.isNaN(code) ||
      lessThan(code, StatusCodes.CONTINUE) ||
      greaterThan(code, StatusCodes.NETWORK_AUTHENTICATION_REQUIRED)
    ) {
      return NextResponse.json(
        {
          id,
          message: getReasonPhrase(StatusCodes.BAD_REQUEST),
          timestamp,
        },
        { status: StatusCodes.BAD_REQUEST },
      )
    }

    if (
      equal(code, StatusCodes.NO_CONTENT) ||
      equal(code, StatusCodes.NOT_MODIFIED) ||
      between(code, { from: StatusCodes.CONTINUE, to: StatusCodes.OK })
    ) {
      return new NextResponse(null, { status: code })
    }

    return NextResponse.json(
      {
        id,
        message: getReasonPhrase(code),
        timestamp,
      },
      { status: code },
    )
  } catch (thrown) {
    return NextResponse.json(
      {
        id,
        message: isNative(thrown) ? thrown.message : undefined,
        timestamp,
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    )
  }
}

export const GET = handler

export const POST = handler
