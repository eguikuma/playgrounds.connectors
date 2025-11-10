import { japanese } from './translation'
import { http } from '../integrations/vanilla'
import type { Found, Translated } from '../models'

export const identifier = (url: string) => url.split('/').filter(Boolean).pop()

const enhance = async (url: string, name: string) => {
  const id = identifier(url)

  if (!id) return { name, url, translation: undefined }

  const response = await http.get<Translated>(`/type/${id}`)

  const translation = response.success ? japanese(response.data.names) : undefined

  return { name, url, translation }
}

export const enrich = async (pokemon: { name: string; url: string }) => {
  const id = identifier(pokemon.url)

  if (!id) return null

  const [response, languages] = await Promise.all([
    http.get<Found>(`/pokemon/${id}`),
    http.get<Translated>(`/pokemon-species/${id}`),
  ])

  if (!response.success) return null

  const translation = languages.success ? japanese(languages.data.names) : undefined

  const types = await Promise.all(
    response.data.types.map(({ type }) => enhance(type.url, type.name)),
  )

  return {
    id: response.data.id,
    name: response.data.name,
    translation,
    image: response.data.sprites.other['official-artwork'].front_default,
    types,
  }
}
