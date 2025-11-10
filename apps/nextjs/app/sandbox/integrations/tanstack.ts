'use client'

import type { Outcome } from '@connectors/http/core'
import { injector, monitor } from '@connectors/http/core/interceptors'
import { factory } from '@connectors/http/tanstack'
import { StatusCodes } from 'http-status-codes'

import { ToastKind, type Snapshot, toaster, type Responded } from '../models'

const snapshot: Snapshot = {
  request: {
    before: {},
    after: {},
  },
  response: {
    status: null,
  },
  on: {
    timelines: [],
  },
}

export const sandbox = factory({
  base: 'http://localhost:3000/api',
  localhost: true,
  interceptors: {
    request: [
      monitor.requested({
        observer: (context) => {
          snapshot.request.before = context.options.headers || {}
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
          snapshot.request.after = context.options.headers || {}
        },
      }),
    ],
    response: [
      monitor.responded({
        observer: async (context) => {
          snapshot.response = context.outcome as Outcome<Responded>
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
  snapshot.request.before = {}
  snapshot.request.after = {}
  snapshot.response.status = null
}
