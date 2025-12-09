'use client'

import { Container, Head, Spinner, Title } from '@kit/components'
import { greaterThanOrEqual } from '@kit/predicates/number'

import { Card } from './card'
import { Pagination } from './pagination'
import { Unavailable } from './unavailable'
import { HttpOptions } from '../integrations/options'
import { http } from '../integrations/tanstack'
import type { PokemonCard } from '../models'
import { usePage } from '../services'

export const Dictionary = ({
  defaults,
  offset,
}: {
  defaults: (PokemonCard | null)[]
  offset: number
}) => {
  const page = usePage()

  const {
    responses: { success },
    states: { loading },
  } = http.useGet(`/pokemons?offset=${offset}`, {
    key: ['pokemons', page],
    defaults,
  })

  return (
    <Container>
      <Head>
        <Title className="text-white bg-linear-to-r from-blue-500 via-green-500 to-red-500">
          HTTP
        </Title>
      </Head>

      <div>
        {loading ? (
          <Spinner />
        ) : (
          <>
            {success && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {success.data.map((pokemon) =>
                  pokemon ? (
                    <Card key={pokemon.id} pokemon={pokemon} page={page} />
                  ) : (
                    <Unavailable key={`unavailable-${Date.now()}`} />
                  ),
                )}
              </div>
            )}
            <Pagination
              page={page}
              more={greaterThanOrEqual(success?.data?.length ?? 0, HttpOptions.Limit)}
              previous={`/http?page=${Math.max(1, page - 1)}`}
              next={`/http?page=${page + 1}`}
            />
          </>
        )}
      </div>
    </Container>
  )
}
