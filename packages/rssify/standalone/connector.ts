import { createGet } from './builders/get/builder'
import { provide } from './helpers/provider'

export const create = provide((http, parser) => ({
  get: createGet(http, parser),
}))
