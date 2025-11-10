'use client'

import { useRouter } from 'next/navigation'

import { Container, Head, Spinner, Title } from '@kit/components'
import { equal, greaterThanOrEqual } from '@kit/predicates'

import { Pagination } from './pagination'
import { search } from '../services'
import { Card } from './card'
import { Unavailable } from './unavailable'
import { HttpOptions } from '../integrations/options'
import { http } from '../integrations/tanstack'
import type { PokemonCard } from '../models'

export const Dictionary = ({
  defaults,
  page,
  offset,
}: {
  defaults: (PokemonCard | null)[]
  page: number
  offset: number
}) => {
  const router = useRouter()

  const {
    responses: { success },
    states: { loading },
  } = http.get(() => search(offset), {
    key: ['pokemons', page],
    defaults: equal(page, 1) ? defaults : undefined,
  })

  const navigate = (page: number) => router.push(`/http?page=${page}`)

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
              previous={() => navigate(Math.max(1, page - 1))}
              next={() => navigate(page + 1)}
            />
          </>
        )}
      </div>
    </Container>
  )
}
