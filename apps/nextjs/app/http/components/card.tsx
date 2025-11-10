import Image from 'next/image'
import Link from 'next/link'

import { Favorite } from './favorite'
import type { PokemonCard } from '../models'

export const Card = ({ pokemon, page }: { pokemon: PokemonCard; page: number }) => (
  <Link
    key={pokemon.id}
    href={`/http/${pokemon.id}?page=${page}`}
    className="group relative bg-white rounded-2xl border-4 border-gray-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-300 overflow-hidden hover:-translate-y-2 hover:-translate-x-1"
  >
    <div className="aspect-square bg-linear-to-br from-red-50 via-blue-50 to-green-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Favorite id={pokemon.id} liked={pokemon.liked} className="absolute top-2 right-2 z-20" />
      <Image
        src={pokemon.image}
        alt={pokemon.translation || pokemon.name}
        width={200}
        height={200}
        className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-all duration-300 relative z-10"
      />
    </div>
    <div className="p-4 bg-linear-to-b from-white to-gray-50 border-t-4 border-gray-800">
      <h2 className="text-lg wrap-anywhere font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
        {pokemon.translation || pokemon.name}
      </h2>
      <div className="flex gap-2 flex-wrap">
        {pokemon.types.map((type) => (
          <span
            key={type.name}
            className={`px-3 py-1.5 rounded-lg text-xs text-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] border-2 border-black/30 bg-linear-to-r from-${type.name}-start to-${type.name}-end`}
          >
            {type.translation || type.name}
          </span>
        ))}
      </div>
    </div>
  </Link>
)
