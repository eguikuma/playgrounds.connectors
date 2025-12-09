import { enrich } from './transform'
import { HttpOptions } from '../integrations/options'
import { http } from '../integrations/standalone'
import type { Listed, PokemonCard } from '../models'

export const search = async (offset: number): Promise<(PokemonCard | null)[] | null> => {
  if (offset < 0 || Number.isNaN(offset)) {
    return null
  }

  const response = await http.get<Listed>('/pokemon', {
    queries: { limit: HttpOptions.Limit, offset },
  })

  if (!response.success) {
    return []
  }

  return await Promise.all(response.data.results.map(enrich))
}
