import { factory } from '@connectors/http/vanilla'
import { StatusCodes } from 'http-status-codes'

export const sandbox = factory({
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
