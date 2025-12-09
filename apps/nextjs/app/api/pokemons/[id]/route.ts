import { type NextRequest, NextResponse } from 'next/server'

import { StatusCodes } from 'http-status-codes'

import { isNative } from '@kit/predicates/exception'

import { find } from '@/http/services'

export const GET = async (_request: NextRequest, context: RouteContext<'/api/pokemons/[id]'>) => {
  try {
    const { id } = await context.params

    const response = await find(id)

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
