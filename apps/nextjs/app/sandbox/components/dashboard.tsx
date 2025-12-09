'use client'

import { useState } from 'react'

import { StatusCodes } from 'http-status-codes'

import { Container, Head, Title, useToast } from '@kit/components'

import { ControlPanel } from './control-panel'
import { OnInterceptor } from './on-interceptor'
import { ResponseInterceptor } from './response-interceptor'
import { Toast } from './toast'
import { Redirect, RunMode, ToastKind, toaster } from '../definitions'
import * as tanstack from '../integrations/tanstack'
import type { Timelines, Snapshot } from '../models'
import { redirect, status } from '../services'
import { RequestInterceptor } from './request-interceptor'

export const Dashboard = () => {
  const [snapshot, setSnapshot] = useState<Snapshot>()
  const [timelines, setTimelines] = useState<Timelines>({
    [RunMode.Client]: [],
    [RunMode.Server]: [],
  })
  const [loading, setLoading] = useState(false)

  const toast = useToast(toaster)

  const client = {
    statuses: tanstack.sandbox.usePost((code: number) => `/statuses/${code}`, {}),
    redirects: {
      [Redirect.Manual]: tanstack.sandbox.usePost((code: number) => `/redirects/${code}`, {
        options: { redirect: Redirect.Manual },
      }),
      [Redirect.Follow]: tanstack.sandbox.usePost((code: number) => `/redirects/${code}`, {
        options: { redirect: Redirect.Follow },
      }),
      [Redirect.Error]: tanstack.sandbox.usePost((code: number) => `/redirects/${code}`, {
        options: { redirect: Redirect.Error },
      }),
    },
  }

  const server = {
    statuses: (code: number) => status(code),
    redirects: {
      [Redirect.Manual]: (code: number) => redirect(code, Redirect.Manual),
      [Redirect.Follow]: (code: number) => redirect(code, Redirect.Follow),
      [Redirect.Error]: (code: number) => redirect(code, Redirect.Error),
    },
  }

  const notify = (kind: string) => {
    switch (kind) {
      case ToastKind.Success:
        toaster.add({ kind: ToastKind.Success, message: 'リクエストが成功しました' })

        break
      case ToastKind.Failed:
        toaster.add({ kind: ToastKind.Failed, message: 'リクエストが失敗しました' })

        break
      case ToastKind.Unauthorized:
        toaster.add({ kind: ToastKind.Unauthorized, message: '認証が必要です' })

        break
      default:
        break
    }
  }

  const executers = {
    [RunMode.Client]: {
      status: async (code: number): Promise<Snapshot> => {
        tanstack.clear()

        await client.statuses.handlers.execute(code)

        return tanstack.captured()
      },
      redirect: async (code: number, mode: Redirect): Promise<Snapshot> => {
        tanstack.clear()

        await client.redirects[mode].handlers.execute(code)

        const snapshot = tanstack.captured()

        return {
          ...snapshot,
          ...(snapshot.response
            ? {
                response: {
                  ...snapshot.response,
                  status: code,
                },
              }
            : {}),
        }
      },
    },
    [RunMode.Server]: {
      status: async (code: number): Promise<Snapshot> => {
        const snapshot = await server.statuses(code)
        const newest = snapshot.on.timelines[0]

        if (newest) {
          notify(newest.kind)
        }

        return {
          ...snapshot,
          on: {
            timelines: [...(newest ? [newest] : []), ...timelines[RunMode.Server]],
          },
        }
      },
      redirect: async (code: number, mode: Redirect): Promise<Snapshot> => {
        const snapshot = await server.redirects[mode](code)
        const newest = snapshot.on.timelines[0]

        if (newest) {
          notify(newest.kind)
        }

        return {
          ...snapshot,
          ...(snapshot.response
            ? {
                response: {
                  ...snapshot.response,
                  status: code,
                },
              }
            : {}),
          on: {
            timelines: [...(newest ? [newest] : []), ...timelines[RunMode.Server]],
          },
        }
      },
    },
  }

  const send = async (code: number, mode: RunMode, redirect: Redirect) => {
    if (loading) return

    try {
      setLoading(true)

      const redirectable = [
        StatusCodes.MOVED_PERMANENTLY,
        StatusCodes.MOVED_TEMPORARILY,
        StatusCodes.TEMPORARY_REDIRECT,
        StatusCodes.PERMANENT_REDIRECT,
      ].includes(code)

      const snapshot = redirectable
        ? await executers[mode].redirect(code, redirect)
        : await executers[mode].status(code)

      setSnapshot(snapshot)
      setTimelines((previous) => ({
        ...previous,
        [mode]: snapshot.on.timelines,
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <Head>
        <Title className="text-white bg-linear-to-r from-purple-400 via-purple-600 to-purple-800">
          Sandbox
        </Title>
      </Head>

      <div className="space-y-8">
        <ControlPanel loading={loading} onSend={send} />

        <RequestInterceptor {...(snapshot ? snapshot.request : { before: null, after: null })} />

        <ResponseInterceptor {...(snapshot?.response ? snapshot.response : { status: null })} />

        <OnInterceptor {...timelines} />
      </div>

      <Toast options={toast.options} />
    </Container>
  )
}
