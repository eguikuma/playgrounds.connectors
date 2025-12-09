import { equal } from '@kit/predicates/number'

type SharedStorage = {
  favorites: {
    id: number
  }[]
}

declare global {
  var _SharedStorage: SharedStorage | undefined
}

const _Storage: SharedStorage = globalThis._SharedStorage ?? {
  favorites: [],
}

globalThis._SharedStorage = _Storage

const indexOf = (id: number): number =>
  _Storage.favorites.findIndex((favorite) => favorite.id === id)

const exists = (id: number): boolean => indexOf(id) !== -1

const isLiked = (id: number): boolean => !!_Storage.favorites.find((favorite) => favorite.id === id)

const isDisliked = (id: number): boolean =>
  !_Storage.favorites.find((favorite) => favorite.id === id)

const like = (id: number): SharedStorage['favorites'][number] => {
  const data = { id }

  _Storage.favorites.push(data)

  return data
}

const dislike = (id: number): void => {
  const index = indexOf(id)

  if (equal(index, -1)) {
    throw new Error()
  }

  _Storage.favorites.splice(index, 1)
}

export const Storage = {
  exists,
  isLiked,
  isDisliked,
  like,
  dislike,
}
