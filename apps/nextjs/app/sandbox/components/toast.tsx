import { twMerge } from 'tailwind-merge'

import { Toast as BaseToast, ToastContainer } from '@kit/components'

import { ToastKind, toaster } from '../definitions'
import type { ToastOption } from '../models'

const ToastCard = ({ option }: { option: ToastOption }) => (
  <BaseToast
    removing={option.removing}
    className={twMerge(
      'flex items-center justify-between gap-4 min-w-80',
      option.kind === ToastKind.Success && 'bg-white',
      option.kind === ToastKind.Failed && 'bg-linear-to-br from-red-50 to-red-100',
      option.kind === ToastKind.Unauthorized && 'bg-linear-to-br from-amber-50 to-amber-100',
    )}
  >
    <div className="flex items-center gap-2">
      {option.kind === ToastKind.Success && (
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <title>Success</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {option.kind === ToastKind.Failed && (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <title>Failed</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
      {option.kind === ToastKind.Unauthorized && (
        <svg
          className="w-6 h-6 text-amber-600"
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
      <span className="text-lg">{option.message}</span>
    </div>
    <button
      type="button"
      onClick={() => toaster.remove(option.id)}
      className="cursor-pointer text-gray-600 hover:text-gray-900 transition-colors"
      aria-label="閉じる"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <title>Close</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </BaseToast>
)

export const Toast = ({ options }: { options: ToastOption[] }) => (
  <ToastContainer>
    {options.map((option) => (
      <ToastCard key={option.id} option={option} />
    ))}
  </ToastContainer>
)
