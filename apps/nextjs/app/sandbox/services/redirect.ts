'use server'

import type { Outcome } from '@connectors/http/core'
import { injector, monitor } from '@connectors/http/core/interceptors'

import { sandbox } from '../integrations/vanilla'
import { ToastKind, type Redirect, type Snapshot, type Responded } from '../models'

export const redirect = async (code: number, mode: Redirect): Promise<Snapshot> => {
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

  await sandbox.post<Responded>(
    `/redirects/${code}`,
    {},
    {
      redirect: mode,
      interceptors: {
        request: [
          monitor.requested({
            observer: (context) => {
              snapshot.request.before = context.options.headers || {}
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
              snapshot.request.after = context.options.headers || {}
            },
          }),
        ],
        response: [
          monitor.responded({
            observer: (context) => {
              snapshot.response = context.outcome as Outcome<Responded>
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
