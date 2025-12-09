import { type NextRequest, NextResponse } from 'next/server'

import { StatusCodes } from 'http-status-codes'

import { isNative } from '@kit/predicates/exception'

import { search } from '@/http/services'

export const GET = async (request: NextRequest) => {
  try {
    const offset = Number(request.nextUrl.searchParams.get('offset') || 0)

    const response = await search(offset)

    return NextResponse.json(response)
  } catch (_thrown) {
    return NextResponse.json(
      {
        message: isNative(_thrown) ? _thrown.message : undefined,
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    )
  }
}
