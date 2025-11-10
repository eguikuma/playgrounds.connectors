import { StatusCodes } from 'http-status-codes'

import { equal } from '@kit/predicates'

import { Dictionary, Fallback } from './components'
import { HttpOptions } from './integrations/options'
import { search } from './services'

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const current = Math.max(1, Number(page) || 1)
  const offset = (current - 1) * HttpOptions.Limit

  const response = await search(offset)

  if (!response.success) {
    return <Fallback code={response.status} text="ポケモンセンターとつながらないみたい..." />
  }

  if (equal(response.data.length, 0)) {
    return <Fallback code={StatusCodes.NOT_FOUND} text="ポケモンがみつからないみたい..." />
  }

  return <Dictionary defaults={response.data} page={current} offset={offset} />
}
