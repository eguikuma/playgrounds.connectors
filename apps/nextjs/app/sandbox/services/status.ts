'use server'

import { injector, monitor } from '@outcomify/requestify'

import { ToastKind } from '../definitions'
import { sandbox } from '../integrations/standalone'
import type { Snapshot, Responded } from '../models'

export const status = async (code: number): Promise<Snapshot> => {
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

  await sandbox.post<Responded>(
    `/statuses/${code}`,
    {},
    {
      interceptors: {
        request: [
          monitor.requested({
            observer: (context) => {
              snapshot.request.before = context
            },
          }),
          injector({
            headers: () => ({
              'X-Server-Request': crypto.randomUUID(),
              'X-Server-Timestamp': new Date().toISOString(),
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
            observer: (context) => {
              snapshot.response = context
            },
          }),
        ],
      },
      on: {
        success: () => {
          snapshot.on.timelines.unshift({
            kind: ToastKind.Success,
            timestamp: new Date(),
          })
        },
        failed: () => {
          snapshot.on.timelines.unshift({
            kind: ToastKind.Failed,
            timestamp: new Date(),
          })
        },
        unauthorized: () => {
          snapshot.on.timelines.unshift({
            kind: ToastKind.Unauthorized,
            timestamp: new Date(),
          })
        },
      },
    },
  )

  return snapshot
}
