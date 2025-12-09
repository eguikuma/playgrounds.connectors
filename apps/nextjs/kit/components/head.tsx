import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react'

import { twMerge } from 'tailwind-merge'

export const Head = ({
  className,
  children,
  ...props
}: PropsWithChildren<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>>) => (
  <header className="mb-5 md:mb-12 mt-16 md:mt-0 px-0 text-left">
    <div className="relative inline-block">
      <div className={twMerge('relative z-10', className)} {...props}>
        {children}
      </div>
    </div>
  </header>
)
