'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import { Fallback as Layout, type FallbackProps } from '@kit/components'

const PokemonIdOptions = {
  Min: 1,
  Max: 1025,
} as const

export const Fallback = ({ code, text }: Omit<FallbackProps, 'link'>) => {
  const [id, setId] = useState<number>()

  useEffect(
    () => setId(Math.floor(Math.random() * PokemonIdOptions.Max) + PokemonIdOptions.Min),
    [],
  )

  return (
    <Layout code={code} text={text} link={{ href: '/http', label: '戻る' }}>
      <div className="relative animate-float">
        {id && (
          <Image
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
            alt="ポケモン"
            width={200}
            height={200}
            className="drop-shadow-2xl"
            priority
          />
        )}
      </div>
    </Layout>
  )
}
