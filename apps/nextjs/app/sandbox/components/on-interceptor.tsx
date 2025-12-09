import { twMerge } from 'tailwind-merge'

import { toYYYYMMDDHHmmss } from '@kit/formatters'
import { equal } from '@kit/predicates/number'

import { RunMode, ToastKind } from '../definitions'
import type { Timeline, Timelines } from '../models'

export const OnInterceptor = ({ client, server }: Timelines) => (
  <section className="bg-white border-4 border-gray-900 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] p-6">
    <h2 className="text-2xl wrap-anywhere font-bold mb-4 text-gray-900 flex items-center gap-2">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <title>On Interceptor</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      On Interceptor
    </h2>

    <div className="flex flex-col lg:flex-row justify-between gap-4">
      <ModeTimelines mode={RunMode.Client} values={client} />
      <ModeTimelines mode={RunMode.Server} values={server} />
    </div>
  </section>
)

const ModeTimelines = ({ mode, values }: { mode: string; values: Timeline[] }) => (
  <div className="relative w-full bg-white border-4 border-gray-900 rounded-lg min-h-80">
    <span
      className={twMerge(
        'inline-block px-3 py-1 border-r-4 border-b-4 border-gray-900 font-bold text-gray-900',
      )}
    >
      {mode === RunMode.Client && (
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <title>クライアント</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>クライアント</span>
        </div>
      )}
      {mode === RunMode.Server && (
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <title>サーバー</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
            />
          </svg>
          <span>サーバー</span>
        </div>
      )}
    </span>
    {equal(values.length, 0) ? (
      <p className="text-gray-500 text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        履歴はまだありません
      </p>
    ) : (
      <div className="h-80 overflow-hidden overflow-y-auto scrollbar p-4 flex flex-col gap-2">
        {values.map((value) => (
          <div
            key={value.timestamp.toISOString()}
            className={twMerge(
              'overflow-hidden overflow-x-auto scrollbar shrink-0',
              'flex items-center gap-3 p-3 rounded-lg border-2 border-gray-900 transition-all',
              'bg-white hover:bg-gray-50',
            )}
          >
            <div className="shrink-0">
              {value.kind === ToastKind.Success && (
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>Success</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {value.kind === ToastKind.Failed && (
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>Failed</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              {value.kind === ToastKind.Unauthorized && (
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>Unauthorized</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1 font-bold text-gray-900">
              {value.kind === ToastKind.Success && ToastKind.Success.toUpperCase()}
              {value.kind === ToastKind.Failed && ToastKind.Failed.toUpperCase()}
              {value.kind === ToastKind.Unauthorized && ToastKind.Unauthorized.toUpperCase()}
            </div>
            <div className="shrink-0 text-sm text-gray-600 font-mono">
              {toYYYYMMDDHHmmss(value.timestamp)}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)
