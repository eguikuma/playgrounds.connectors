import { type NextRequest, NextResponse } from 'next/server'

import { getReasonPhrase, StatusCodes } from 'http-status-codes'

import { Storage } from '@/http/services'

export const DELETE = async (
  _request: NextRequest,
  context: RouteContext<'/api/favorites/[id]'>,
) => {
  try {
    const id = Number((await context.params).id)

    if (Number.isNaN(id)) {
      return NextResponse.json(
        {
          message: getReasonPhrase(StatusCodes.BAD_REQUEST),
        },
        { status: StatusCodes.BAD_REQUEST },
      )
    }

    if (!Storage.exists(id)) {
      return NextResponse.json(
        {
          message: getReasonPhrase(StatusCodes.NOT_FOUND),
        },
        { status: StatusCodes.NOT_FOUND },
      )
    }

    if (Storage.isDisliked(id)) {
      return NextResponse.json(
        {
          message: getReasonPhrase(StatusCodes.CONFLICT),
        },
        { status: StatusCodes.CONFLICT },
      )
    }

    Storage.dislike(id)

    return NextResponse.json({
      data: { id },
    })
  } catch (_thrown) {
    return NextResponse.json(
      {
        message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    )
  }
}
