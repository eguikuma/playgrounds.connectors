import { createDelete } from './builders/delete/builder'
import { createGet } from './builders/get/builder'
import { createPatch } from './builders/patch/builder'
import { createPost } from './builders/post/builder'
import { createPut } from './builders/put/builder'
import { provide } from './helpers/provider'

export const create = provide((outcomer) => ({
  get: createGet(outcomer),
  post: createPost(outcomer),
  put: createPut(outcomer),
  patch: createPatch(outcomer),
  delete: createDelete(outcomer),
}))
