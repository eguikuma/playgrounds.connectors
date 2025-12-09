'use client'

import { useState } from 'react'

import { StatusCodes } from 'http-status-codes'
import { twMerge } from 'tailwind-merge'

import { Dropdown, Toggle, Trigger } from '@kit/components'

import { Redirect, RunMode, Statuses } from '../definitions'

export const ControlPanel = ({
  loading,
  onSend,
}: {
  loading: boolean
  onSend: (code: number, mode: RunMode, redirect: Redirect) => void
}) => {
  const [code, setCode] = useState(StatusCodes.OK)
  const [mode, setMode] = useState<RunMode>(RunMode.Client)
  const [redirect, setRedirect] = useState<Redirect>(Redirect.Follow)

  return (
    <section className="bg-white border-4 border-gray-900 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] p-6">
      <h2 className="text-2xl wrap-anywhere font-bold mb-4 text-gray-900 flex items-center gap-2">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <title>Control Panel</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        Control Panel
      </h2>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <Dropdown
            className="w-full lg:max-w-md"
            options={Statuses.map((status) => ({ value: status.value, label: status.label }))}
            value={code}
            button={{ className: 'focus:ring-purple-300' }}
            selected={{ className: 'bg-purple-100' }}
            onChange={setCode}
          />

          <Toggle
            className="w-full lg:w-auto"
            options={[
              { value: RunMode.Client, label: 'クライアント' },
              { value: RunMode.Server, label: 'サーバー' },
            ]}
            value={mode}
            active={{ className: 'bg-purple-500 text-white' }}
            onChange={setMode}
          />

          <Toggle
            className={twMerge(
              'w-full lg:w-auto',
              !(code >= StatusCodes.MULTIPLE_CHOICES && code < StatusCodes.BAD_REQUEST) &&
                'opacity-50 pointer-events-none',
            )}
            options={[
              { value: Redirect.Follow, label: 'Follow' },
              { value: Redirect.Manual, label: 'Manual' },
              { value: Redirect.Error, label: 'Error' },
            ]}
            value={redirect}
            active={{ className: 'bg-purple-500 text-white' }}
            onChange={setRedirect}
          />
        </div>

        <Trigger kind="button" onClick={() => onSend(code, mode, redirect)} disabled={loading}>
          送信
        </Trigger>
      </div>
    </section>
  )
}
