import type { ButtonHTMLAttributes, DetailedHTMLProps, HTMLAttributes } from 'react'

import { twMerge } from 'tailwind-merge'

import { equal } from '@kit/predicates'

type ToggleOption<Value = string> = { value: Value; label: string }

export const Toggle = <Value extends string>({
  options,
  value,
  active,
  className,
  onChange,
  ...props
}: {
  options: ToggleOption<Value>[]
  value: Value
  active?: Pick<
    DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
    'className'
  >
  onChange: (value: Value) => void
} & Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'onChange'>) => (
  <div
    className={twMerge(
      'grid grid-flow-col auto-cols-fr border-4 border-gray-900 rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      className,
    )}
    {...props}
  >
    {options.map((option, index) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={twMerge(
          'cursor-pointer',
          'px-6 py-3 font-bold transition-all',
          !equal(index, 0) && 'border-l-4 border-gray-900',
          option.value === value
            ? twMerge('bg-gray-700 text-white', active?.className)
            : 'bg-white text-gray-900 hover:bg-gray-100',
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
)
