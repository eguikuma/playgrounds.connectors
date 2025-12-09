import { StatusCodes } from 'http-status-codes'

import { create } from '@outcomify/restify'

export const sandbox = create({
  base: 'http://localhost:3000/api',
  localhost: true,
  status: {
    success: [
      StatusCodes.MOVED_PERMANENTLY,
      StatusCodes.MOVED_TEMPORARILY,
      StatusCodes.TEMPORARY_REDIRECT,
      StatusCodes.PERMANENT_REDIRECT,
    ],
  },
})
