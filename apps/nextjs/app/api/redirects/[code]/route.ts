import { type NextRequest, NextResponse } from 'next/server'

import { getReasonPhrase, StatusCodes } from 'http-status-codes'

import { isNative } from '@kit/predicates/exception'

export const POST = async (
  request: NextRequest,
  context: RouteContext<'/api/redirects/[code]'>,
) => {
  const id = request.headers.has('X-Client-Request')
    ? `client:${request.headers.get('X-Client-Request')}`
    : request.headers.get('X-Server-Request')
      ? `server:${request.headers.get('X-Server-Request')}`
      : 'unknown'
  const code = Number((await context.params).code)
  const timestamp = new Date().toISOString()
  const destination = new URL(`/api/statuses/${StatusCodes.OK}`, request.url).toString()

  try {
    if (
      Number.isNaN(code) ||
      ![
        StatusCodes.MOVED_PERMANENTLY,
        StatusCodes.MOVED_TEMPORARILY,
        StatusCodes.TEMPORARY_REDIRECT,
        StatusCodes.PERMANENT_REDIRECT,
      ].includes(code)
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

    return NextResponse.json(
      {
        id,
        message: getReasonPhrase(code),
        timestamp,
      },
      {
        status: code,
        headers: {
          Location: destination,
        },
      },
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
