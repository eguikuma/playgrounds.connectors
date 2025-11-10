import type { ButtonHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from 'react'

import type { Route } from 'next'
import Link, { type LinkProps } from 'next/link'

import { twMerge } from 'tailwind-merge'

const Kind = {
  Button: 'button',
  Link: 'link',
} as const

export const Trigger = ({
  className,
  children,
  ...props
}: PropsWithChildren<
  | ({
      kind: 'button'
    } & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>)
  | ({
      kind: 'link'
    } & LinkProps<Route> & { className?: string })
>) => {
  const classes = twMerge(
    'cursor-pointer inline-block px-6 py-3 bg-linear-to-b from-gray-300 to-gray-500 text-gray-900 rounded-lg font-bold border-4 border-gray-900',
    'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    'active:translate-x-1 active:translate-y-1 transition-all duration-150',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:active:translate-x-0 disabled:active:translate-y-0',
    className,
  )

  if (props.kind === Kind.Button) {
    return (
      <button type="button" className={classes} {...props}>
        {children}
      </button>
    )
  }

  return (
    <Link className={classes} {...props}>
      {children}
    </Link>
  )
}
