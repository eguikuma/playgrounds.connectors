'use client'

import {
  type DetailedHTMLProps,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useState,
} from 'react'

import { twMerge } from 'tailwind-merge'

import { Toaster, type ToastOption } from '@kit/providers'

export const ToastContainer = ({
  className,
  children,
}: Pick<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'className' | 'children'
>) => (
  <div className={twMerge('fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3', className)}>
    {children}
  </div>
)

export const Toast = ({
  className,
  children,
  removing,
}: {
  children: ReactNode
  removing?: boolean
} & Pick<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'className'>) => (
  <div
    className={twMerge(
      'border-4 border-gray-900 rounded-xl p-4 font-bold text-gray-900 transition-all duration-300',
      'shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.9)] hover:-translate-y-1 hover:-translate-x-1 animate-slide-in',
      removing && 'opacity-0 translate-x-full',
      className,
    )}
  >
    {children}
  </div>
)

export const useToast = <Properties = Record<string, unknown>>(
  instance: Toaster<Properties> = new Toaster<Properties>(),
) => {
  const [options, setOptions] = useState<ToastOption<Properties>[]>([])

  useEffect(() => {
    const unsubscribe = instance.subscribe(setOptions)

    setOptions(instance.options)

    return unsubscribe
  }, [instance])

  return {
    options,
    add: (option: Omit<ToastOption<Properties>, 'id' | 'removing'>) => instance.add(option),
    remove: (id: string) => instance.remove(id),
  }
}
