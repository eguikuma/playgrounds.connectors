export type PokemonCard = {
  id: number
  name: string
  translation?: string
  image: string
  types: {
    name: string
    url: string
    translation?: string
  }[]
  liked: boolean
}

export type PokemonProfile = {
  id: number
  name: string
  height: number
  weight: number
  image: string
  translation?: string
  types: { name: string; translation?: string }[]
  statistics: { value: number; name: string; translation?: string }[]
  abilities: { name: string; translation?: string }[]
  liked: boolean
}
