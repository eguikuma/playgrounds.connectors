'use client'

import { useEffect } from 'react'

import { useQueryState } from 'nuqs'

import { equal } from '@kit/predicates/number'

import { page } from './parameters.server'

export const usePage = () => {
  const [value, setValue] = useQueryState('page', page)

  useEffect(() => {
    if (equal(value, 1)) {
      setValue(1)
    }
  }, [setValue, value])

  return value
}
