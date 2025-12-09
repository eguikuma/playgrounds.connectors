import type { Route } from 'next'

import { Trigger } from '@kit/components'

type Example = {
  id: string
  title: string
  href: Route
  available: boolean
}

const Examples: Example[] = [
  { id: 'http', title: 'HTTP', href: '/http', available: true },
  { id: 'rss', title: 'RSS', href: '/rss', available: true },
  { id: 'sandbox', title: 'SANDBOX', href: '/sandbox', available: true },
]

export default function Page() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div className="relative z-10 flex flex-col items-center gap-16">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-center wrap-anywhere text-6xl font-black text-gray-900">
            my.http-connectors
          </h1>
          <p className="text-center text-xl font-semibold text-gray-700">
            外部とのやり取りを検証するためのプロジェクトです。
          </p>
        </div>

        <div className="w-full grid grid-cols-1 gap-8 md:grid-cols-2">
          {Examples.map((example) => (
            <div key={example.id} className="group relative">
              <div className="relative flex flex-col items-center gap-6 rounded-3xl border-8 border-gray-900 bg-white p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-300 hover:scale-105 hover:rotate-1">
                <div className="flex h-32 w-auto items-center justify-center">
                  <h2 className="animate-float wrap-anywhere text-6xl font-black text-gray-900">
                    {example.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  {example.available ? (
                    <Trigger kind="link" href={example.href}>
                      見る →
                    </Trigger>
                  ) : (
                    <span className="inline-block rounded-lg border-4 border-gray-900 bg-linear-to-b from-gray-200 to-gray-300 px-6 py-3 font-bold text-gray-500">
                      準備中
                    </span>
                  )}
                </div>

                {example.available && (
                  <div className="absolute -right-4 -top-4 rounded-full border-4 border-gray-900 bg-linear-to-br from-gray-600 to-gray-800 px-4 py-2 text-sm font-black text-white shadow-lg">
                    利用可能
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
