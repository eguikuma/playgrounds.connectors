import { StatusCodes } from 'http-status-codes'

import { Fallback } from '@kit/components'

export default function NotFound() {
  return (
    <Fallback
      code={StatusCodes.NOT_FOUND}
      text="ページが見つかりません..."
      link={{ href: '/', label: '戻る' }}
    >
      <div className="animate-float">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-48 w-48 text-gray-700"
        >
          <title>Search</title>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
    </Fallback>
  )
}
