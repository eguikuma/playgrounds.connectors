export type Listed = {
  count: number
  results: {
    name: string
    url: string
  }[]
}

export type Translated = {
  names: {
    name: string
    language: {
      name: string
    }
  }[]
}

export type Found = {
  id: number
  name: string
  height: number
  weight: number
  types: {
    type: {
      name: string
      url: string
    }
  }[]
  stats: {
    base_stat: number
    stat: {
      name: string
      url: string
    }
  }[]
  sprites: {
    other: {
      'official-artwork': {
        front_default: string
      }
    }
  }
  abilities: {
    ability: {
      name: string
      url: string
    }
  }[]
}
