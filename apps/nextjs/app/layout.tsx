import type { PropsWithChildren } from 'react'

import { Nunito } from 'next/font/google'

import './globals.css'

import { Nuqs, TanstackQuery } from '@kit/providers'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-nunito',
})

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="ja">
      <body
        className={`${nunito.variable} min-h-screen bg-linear-to-br from-gray-50 via-gray-100 to-gray-200`}
      >
        <Nuqs>
          <TanstackQuery>{children}</TanstackQuery>
        </Nuqs>
      </body>
    </html>
  )
}
