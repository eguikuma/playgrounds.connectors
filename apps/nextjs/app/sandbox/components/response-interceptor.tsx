import { StatusCodes } from 'http-status-codes'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { twMerge } from 'tailwind-merge'

import { between } from '@kit/predicates/number'

import type { Snapshot } from '../models'

export const ResponseInterceptor = (
  response: NonNullable<Snapshot['response']> | { status: null },
) => (
  <section className="bg-white border-4 border-gray-900 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] p-6">
    <h2 className="text-2xl wrap-anywhere font-bold mb-4 text-gray-900 flex items-center gap-2">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <title>Response Interceptor</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
      Response Interceptor
    </h2>

    <div className="bg-white border-4 border-gray-900 rounded-lg overflow-hidden flex flex-col">
      <span
        className={twMerge(
          'self-start px-3 py-1 border-r-4 border-b-4 border-gray-900 font-bold block min-w-14 text-center',
          !response.status
            ? 'text-gray-900'
            : between(response.status, { from: StatusCodes.OK, to: StatusCodes.MULTIPLE_CHOICES })
              ? 'bg-linear-to-r from-green-400 to-green-600 text-white'
              : between(response.status, {
                    from: StatusCodes.MULTIPLE_CHOICES,
                    to: StatusCodes.BAD_REQUEST,
                  })
                ? 'bg-linear-to-r from-amber-400 to-amber-600 text-white'
                : 'bg-linear-to-r from-red-400 to-red-600 text-white',
        )}
      >
        {response.status ? response.status : '-'}
      </span>
      <div className="flex-1 p-4 overflow-hidden overflow-x-auto scrollbar">
        <SyntaxHighlighter
          language="json"
          style={oneDark}
          customStyle={{
            height: '100%',
            minHeight: '155px',
            display: 'flex',
            alignItems: 'center',
            margin: 0,
          }}
        >
          {JSON.stringify(response, null, 2)}
        </SyntaxHighlighter>
      </div>
    </div>
  </section>
)
