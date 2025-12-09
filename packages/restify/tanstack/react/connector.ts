'use client'

import { provide } from '../helpers/provider'
import { createInfiniteQuery } from './builders/infinite/builder'
import { createMutation } from './builders/mutation/builder'
import { createQuery } from './builders/query/builder'

export const create = provide((outcomer) => ({
  useGet: createQuery(outcomer),
  useInfinite: createInfiniteQuery(outcomer),
  usePost: createMutation(outcomer, 'POST'),
  usePut: createMutation(outcomer, 'PUT'),
  usePatch: createMutation(outcomer, 'PATCH'),
  useDelete: createMutation(outcomer, 'DELETE'),
}))
