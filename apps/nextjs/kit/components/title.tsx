import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react'

import { twMerge } from 'tailwind-merge'

export const Title = ({
  className,
  children,
  ...props
}: PropsWithChildren<
  DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
>) => (
  <h1
    className={twMerge(
      'px-8 pt-4 pb-5',
      'flex items-center',
      'leading-none wrap-anywhere',
      'text-5xl md:text-6xl font-bold border-8 border-gray-900 rounded-2xl md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
      'transform hover:scale-105 transition-transform duration-300',
      className,
    )}
    {...props}
  >
    {children}
  </h1>
)
