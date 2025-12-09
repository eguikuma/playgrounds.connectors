import type { ButtonHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from 'react'

import type { Route } from 'next'
import Link, { type LinkProps } from 'next/link'

import { twMerge } from 'tailwind-merge'

const Kind = {
  Button: 'button',
  Link: 'link',
} as const

export const Trigger = ({
  kind,
  headless,
  dynamic = false,
  className,
  children,
  ...props
}: PropsWithChildren<
  | ({
      kind: 'button'
      headless?: boolean
      dynamic?: false
    } & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>)
  | ({
      kind: 'link'
      headless?: boolean
      dynamic?: false
    } & LinkProps<Route> & { disabled?: boolean; className?: string })
  | ({
      kind: 'link'
      headless?: boolean
      dynamic: true
    } & Omit<LinkProps<Route>, 'href'> & {
        href: string
        disabled?: boolean
        className?: string
      })
>) => {
  const classes = twMerge(
    !headless && [
      'cursor-pointer inline-block px-6 py-3 bg-linear-to-b from-gray-300 to-gray-500 text-gray-900 rounded-lg font-bold border-4 border-gray-900',
      'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
      'active:translate-x-1 active:translate-y-1 transition-all duration-150',
      'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:active:translate-x-0 disabled:active:translate-y-0',
      props.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
    ],
    className,
  )

  if (kind === Kind.Button) {
    return (
      <button
        type="button"
        className={classes}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    )
  }

  return (
    <Link className={classes} prefetch {...(props as LinkProps<Route>)}>
      {children}
    </Link>
  )
}
