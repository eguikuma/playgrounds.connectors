import { StatusCodes as HttpStatusCodes } from 'http-status-codes'

export const StatusCodes = {
  ...HttpStatusCodes,
  NO_RESPONSE: 0,
} as const

export type StatusCodes = (typeof StatusCodes)[keyof typeof StatusCodes]

export type Responded = {
  id: string
  message: string
  timestamp: string
}

export type Snapshot = {
  request: {
    before: object
    after: object
  }
  response: {
    status: number | null
    [key: string]: unknown
  }
  on: {
    timelines: {
      kind: string
      timestamp: Date
    }[]
  }
}
