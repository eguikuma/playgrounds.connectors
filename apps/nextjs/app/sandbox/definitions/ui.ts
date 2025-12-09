import { getReasonPhrase, StatusCodes } from 'http-status-codes'

import { Toaster } from '@kit/providers'

import type { Status, ToastOption } from '../models'

export const RunMode = {
  Client: 'client',
  Server: 'server',
} as const

export type RunMode = (typeof RunMode)[keyof typeof RunMode]

export const Redirect = {
  Follow: 'follow',
  Manual: 'manual',
  Error: 'error',
} as const

export type Redirect = (typeof Redirect)[keyof typeof Redirect]

export const StatusCategory = {
  NoFault: '2xx',
  Redirect: '3xx',
  ClientFault: '4xx',
  ServerFault: '5xx',
} as const

export type StatusCategory = (typeof StatusCategory)[keyof typeof StatusCategory]

export const Statuses: Status[] = [
  {
    value: StatusCodes.OK,
    label: `${StatusCodes.OK} ${getReasonPhrase(StatusCodes.OK)}`,
    category: StatusCategory.NoFault,
  },
  {
    value: StatusCodes.CREATED,
    label: `${StatusCodes.CREATED} ${getReasonPhrase(StatusCodes.CREATED)}`,
    category: StatusCategory.NoFault,
  },
  {
    value: StatusCodes.NO_CONTENT,
    label: `${StatusCodes.NO_CONTENT} ${getReasonPhrase(StatusCodes.NO_CONTENT)}`,
    category: StatusCategory.NoFault,
  },
  {
    value: StatusCodes.MOVED_PERMANENTLY,
    label: `${StatusCodes.MOVED_PERMANENTLY} ${getReasonPhrase(StatusCodes.MOVED_PERMANENTLY)}`,
    category: StatusCategory.Redirect,
  },
  {
    value: StatusCodes.MOVED_TEMPORARILY,
    label: `${StatusCodes.MOVED_TEMPORARILY} ${getReasonPhrase(StatusCodes.MOVED_TEMPORARILY)}`,
    category: StatusCategory.Redirect,
  },
  {
    value: StatusCodes.TEMPORARY_REDIRECT,
    label: `${StatusCodes.TEMPORARY_REDIRECT} ${getReasonPhrase(StatusCodes.TEMPORARY_REDIRECT)}`,
    category: StatusCategory.Redirect,
  },
  {
    value: StatusCodes.PERMANENT_REDIRECT,
    label: `${StatusCodes.PERMANENT_REDIRECT} ${getReasonPhrase(StatusCodes.PERMANENT_REDIRECT)}`,
    category: StatusCategory.Redirect,
  },
  {
    value: StatusCodes.BAD_REQUEST,
    label: `${StatusCodes.BAD_REQUEST} ${getReasonPhrase(StatusCodes.BAD_REQUEST)}`,
    category: StatusCategory.ClientFault,
  },
  {
    value: StatusCodes.UNAUTHORIZED,
    label: `${StatusCodes.UNAUTHORIZED} ${getReasonPhrase(StatusCodes.UNAUTHORIZED)}`,
    category: StatusCategory.ClientFault,
  },
  {
    value: StatusCodes.FORBIDDEN,
    label: `${StatusCodes.FORBIDDEN} ${getReasonPhrase(StatusCodes.FORBIDDEN)}`,
    category: StatusCategory.ClientFault,
  },
  {
    value: StatusCodes.NOT_FOUND,
    label: `${StatusCodes.NOT_FOUND} ${getReasonPhrase(StatusCodes.NOT_FOUND)}`,
    category: StatusCategory.ClientFault,
  },
  {
    value: StatusCodes.INTERNAL_SERVER_ERROR,
    label: `${StatusCodes.INTERNAL_SERVER_ERROR} ${getReasonPhrase(
      StatusCodes.INTERNAL_SERVER_ERROR,
    )}`,
    category: StatusCategory.ServerFault,
  },
  {
    value: StatusCodes.BAD_GATEWAY,
    label: `${StatusCodes.BAD_GATEWAY} ${getReasonPhrase(StatusCodes.BAD_GATEWAY)}`,
    category: StatusCategory.ServerFault,
  },
  {
    value: StatusCodes.SERVICE_UNAVAILABLE,
    label: `${StatusCodes.SERVICE_UNAVAILABLE} ${getReasonPhrase(StatusCodes.SERVICE_UNAVAILABLE)}`,
    category: StatusCategory.ServerFault,
  },
]

export const ToastKind = {
  Success: 'success',
  Failed: 'failed',
  Unauthorized: 'unauthorized',
} as const

export type ToastKind = (typeof ToastKind)[keyof typeof ToastKind]

export const toaster = new Toaster<ToastOption>({ max: 3 })
