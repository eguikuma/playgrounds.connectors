import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react'

import type { Route } from 'next'

import { twMerge } from 'tailwind-merge'

import { Trigger } from './trigger'

export type FallbackProps = PropsWithChildren<
  {
    code: number
    text: string
    link: {
      href: Route
      label: string
    }
  } & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>

export const Fallback = ({ code, text, link, className, children, ...props }: FallbackProps) => (
  <div
    className={twMerge(
      'relative flex min-h-screen items-center justify-center overflow-hidden px-4',
      className,
    )}
    {...props}
  >
    <div className="relative z-10 flex flex-col items-center gap-8">
      <div className="group relative">
        <div className="relative rounded-3xl border-8 border-gray-900 bg-white p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-300 hover:scale-105 hover:rotate-1">
          <div className="flex h-64 w-64 items-center justify-center">{children}</div>
        </div>

        <div className="absolute -right-6 -top-6 flex h-20 w-20 animate-subtle-pulse items-center justify-center rounded-full border-4 border-gray-900 bg-linear-to-br from-red-500 to-orange-500 shadow-lg">
          <span className="text-2xl font-black text-white">{code}</span>
        </div>
      </div>

      <div className="min-w-96 rounded-2xl border-4 border-gray-900 bg-white px-12 py-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.7)] transition-transform duration-300 hover:scale-105">
        <p className="text-center text-3xl font-bold text-gray-900">{text}</p>
      </div>

      <Trigger kind="link" href={link.href}>
        ← {link.label}
      </Trigger>
    </div>
  </div>
)
