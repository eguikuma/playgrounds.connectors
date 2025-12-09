import { StatusCodes } from 'http-status-codes'

import { equal } from '@kit/predicates/number'

import { Dictionary, Fallback } from './components'
import { HttpOptions } from './integrations/options'
import { queries, search } from './services'

export default async function Page(props: PageProps<'/http'>) {
  const { page } = await queries.parse(props.searchParams)
  const offset = (Math.max(1, page) - 1) * HttpOptions.Limit

  const response = await search(offset)

  if (!response) {
    return (
      <Fallback
        code={StatusCodes.INTERNAL_SERVER_ERROR}
        text="ポケモンセンターとつながらないみたい..."
      />
    )
  }

  if (equal(response.length, 0)) {
    return <Fallback code={StatusCodes.NOT_FOUND} text="ポケモンがみつからないみたい..." />
  }

  return <Dictionary defaults={response} offset={offset} />
}
