import { Storage } from './storage'
import { identifier } from './transform'
import { hiragana, japanese } from './translation'
import { http } from '../integrations/standalone'
import type { Found, PokemonProfile, Translated } from '../models'

export const find = async (id: string): Promise<PokemonProfile | null> => {
  const [response, languages] = await Promise.all([
    http.get<Found>(`/pokemon/${id}`),
    http.get<Translated>(`/pokemon-species/${id}`),
  ])

  if (!response.success) {
    return null
  }

  const pokemon = response.data
  const translation = languages.success ? japanese(languages.data.names) : undefined

  const [types, statistics, abilities] = await Promise.all([
    Promise.all(
      pokemon.types.map(async (entry) => {
        const id = identifier(entry.type.url)
        const response = await http.get<Translated>(`/type/${id}`)

        return {
          name: entry.type.name,
          translation: response.success ? japanese(response.data.names) : undefined,
        }
      }),
    ),
    Promise.all(
      pokemon.stats.map(async (entry) => {
        const id = identifier(entry.stat.url)
        const response = await http.get<Translated>(`/stat/${id}`)

        return {
          value: entry.base_stat,
          name: entry.stat.name,
          translation: response.success ? hiragana(response.data.names) : undefined,
        }
      }),
    ),
    Promise.all(
      pokemon.abilities.map(async (entry) => {
        const id = identifier(entry.ability.url)
        const response = await http.get<Translated>(`/ability/${id}`)

        return {
          name: entry.ability.name,
          translation: response.success ? japanese(response.data.names) : undefined,
        }
      }),
    ),
  ])

  return {
    id: pokemon.id,
    name: pokemon.name,
    height: pokemon.height,
    weight: pokemon.weight,
    image: pokemon.sprites.other['official-artwork'].front_default,
    translation,
    types,
    statistics,
    abilities,
    liked: Storage.isLiked(pokemon.id),
  }
}
