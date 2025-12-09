'use client'

import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  type MouseEvent,
} from 'react'

import { twMerge } from 'tailwind-merge'

import { http } from '../integrations/tanstack'

export const Favorite = ({
  page,
  id,
  liked: _liked,
  className,
  ...props
}: {
  page: number
  id: number
  liked: boolean
} & Omit<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'id'>) => {
  const [liked, setLiked] = useState(_liked)

  const {
    states: { pending: adding },
    handlers: { fire: add },
  } = http.usePost('/favorites', {
    key: ['favorites', 'add'],
    invalidates: [
      { key: ['pokemons', page], exact: true, refetch: 'all' },
      { key: ['pokemons', page, id], refetch: 'all' },
    ],
    success: () => {
      setLiked(true)
    },
    failed: () => {
      setLiked(false)
    },
  })

  const {
    states: { pending: removing },
    handlers: { fire: remove },
  } = http.useDelete(`/favorites/${id}`, {
    key: ['favorites', 'remove'],
    invalidates: [
      { key: ['pokemons', page], exact: true, refetch: 'all' },
      { key: ['pokemons', page, id], refetch: 'all' },
    ],
    success: () => {
      setLiked(false)
    },
    failed: () => {
      setLiked(true)
    },
  })

  const pending = adding || removing

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (pending) {
      return
    }

    if (liked) {
      remove({ id })
    } else {
      add({ id })
    }
  }

  useEffect(() => {
    setLiked(_liked)
  }, [_liked])

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={twMerge(
        'cursor-pointer p-2 rounded-full transition-all duration-200',
        pending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95',
        liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500',
        className,
      )}
      aria-label={liked ? 'お気に入りから削除' : 'お気に入りに追加'}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className="w-6 h-6"
        role="img"
      >
        <title>{liked ? 'Liked' : 'UnLiked'}</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}
