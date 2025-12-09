import type { StatusCodes } from 'http-status-codes'

import type { ToastOption as BaseToastOption } from '@kit/providers'

import type { RunMode, StatusCategory, ToastKind } from '../definitions'

export type Status = {
  value: StatusCodes
  label: string
  category: StatusCategory
}

export type Timeline = {
  kind: string
  timestamp: Date
}

export type Timelines = {
  [RunMode.Client]: Timeline[]
  [RunMode.Server]: Timeline[]
}

export type ToastOption = BaseToastOption<{
  kind: ToastKind
  message: string
}>
