'use client'

import { StatusCodes } from 'http-status-codes'

import { injector, monitor } from '@outcomify/requestify'
import { create } from '@outcomify/restify-tanstack/react'

import { ToastKind, toaster } from '../definitions'
import type { Snapshot } from '../models'

const snapshot: Snapshot = {
  request: {
    before: null,
    after: null,
  },
  response: null,
  on: {
    timelines: [],
  },
}

export const sandbox = create({
  base: 'http://localhost:3000/api',
  localhost: true,
  interceptors: {
    request: [
      monitor.requested({
        observer: (context) => {
          snapshot.request.before = context
        },
      }),
      injector({
        headers: () => ({
          'X-Client-Request': crypto.randomUUID(),
          'X-Client-Timestamp': new Date().toISOString(),
        }),
      }),
      monitor.requested({
        observer: (context) => {
          snapshot.request.after = context
        },
      }),
    ],
    response: [
      monitor.responded({
        observer: async (context) => {
          snapshot.response = context
        },
      }),
    ],
  },
  on: {
    success: () => {
      toaster.add({
        kind: ToastKind.Success,
        message: 'リクエストが成功しました',
      })

      snapshot.on.timelines.unshift({
        kind: ToastKind.Success,
        timestamp: new Date(),
      })
    },
    failed: () => {
      toaster.add({
        kind: ToastKind.Failed,
        message: 'リクエストが失敗しました',
      })

      snapshot.on.timelines.unshift({
        kind: ToastKind.Failed,
        timestamp: new Date(),
      })
    },
    unauthorized: () => {
      toaster.add({
        kind: ToastKind.Unauthorized,
        message: '認証が必要です',
      })

      snapshot.on.timelines.unshift({
        kind: ToastKind.Unauthorized,
        timestamp: new Date(),
      })
    },
  },
  status: {
    success: [
      StatusCodes.MOVED_PERMANENTLY,
      StatusCodes.MOVED_TEMPORARILY,
      StatusCodes.TEMPORARY_REDIRECT,
      StatusCodes.PERMANENT_REDIRECT,
    ],
  },
})

export const captured = () => snapshot

export const clear = () => {
  snapshot.request.before = null
  snapshot.request.after = null
  snapshot.response = null
}
