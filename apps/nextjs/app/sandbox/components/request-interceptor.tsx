import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

import type { Snapshot } from '../models'

export const RequestInterceptor = ({ before, after }: Snapshot['request']) => (
  <section className="bg-white border-4 border-gray-900 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] p-6">
    <h2 className="text-2xl wrap-anywhere font-bold mb-4 text-gray-900 flex items-center gap-2">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <title>Request Interceptor</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
      Request Interceptor
    </h2>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border-4 border-gray-900 rounded-lg overflow-hidden flex flex-col">
        <span className="self-start px-3 py-1 border-r-4 border-b-4 border-gray-900 font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <title>変更前</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          変更前
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
            {JSON.stringify(before, null, 2)}
          </SyntaxHighlighter>
        </div>
      </div>
      <div className="bg-white border-4 border-gray-900 rounded-lg overflow-hidden flex flex-col">
        <span className="self-start px-3 py-1 border-r-4 border-b-4 border-gray-900 font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <title>変更後</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
          変更後
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
            {JSON.stringify(after, null, 2)}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  </section>
)
