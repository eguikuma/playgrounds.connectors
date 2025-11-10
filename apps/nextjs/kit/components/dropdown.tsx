'use client'

import {
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  type HTMLAttributes,
  useState,
} from 'react'

import { twMerge } from 'tailwind-merge'

type DropdownOption<Value = string | number> = { value: Value; label: string }

export const Dropdown = <Value extends number | string>({
  options,
  value,
  className,
  button,
  selected,
  onChange,
  ...props
}: {
  options: DropdownOption<Value>[]
  value: Value
  onChange: (value: Value) => void
  button?: Omit<
    DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    'onClick' | 'onChange'
  >
  selected?: Omit<
    DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    'onClick' | 'onChange'
  >
} & Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'onChange'>) => {
  const [open, setOpen] = useState(false)

  return (
    <div className={twMerge('relative flex-1', className)} {...props}>
      <button
        {...button}
        type="button"
        onClick={() => setOpen(!open)}
        className={twMerge(
          'w-full px-4 py-3',
          'flex items-center justify-between',
          'cursor-pointer',
          'bg-white',
          'font-bold text-gray-900',
          'border-4 border-gray-900 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
          'hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5',
          'focus:ring-8 focus:ring-gray-300 focus:hover:shadow-none',
          'transition-all duration-150',
          button?.className,
        )}
      >
        <span>{options.find((option) => option.value === value)?.label || '選択してください'}</span>
        <svg
          className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <title>Dropdown</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-gray-900 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10 max-h-80 overflow-y-auto scrollbar">
          {options.map((option) => (
            <button
              {...selected}
              key={String(option.value)}
              type="button"
              onClick={() => {
                onChange(option.value)

                setOpen(false)
              }}
              className={twMerge(
                'w-full px-4 py-3',
                'cursor-pointer',
                'text-left font-bold',
                'border-b-2 border-gray-300 last:border-b-0',
                'hover:bg-gray-100 transition-colors',
                option.value === value && twMerge('bg-gray-200', selected?.className),
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
