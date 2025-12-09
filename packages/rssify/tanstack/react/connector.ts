'use client'

import { provide } from '../helpers/provider'
import { createQuery } from './builders/get/builder'
import { createInfiniteQuery } from './builders/infinite/builder'

export const create = provide((rss, http) => ({
  useGet: createQuery(rss, http),
  useInfinite: createInfiniteQuery(rss, http),
}))
