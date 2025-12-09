import { StatusCodes } from 'http-status-codes'

import { Fallback, Feeds } from '../components'
import { channel, find } from '../services'

export default async function Page(props: PageProps<'/rss/[slug]'>) {
  const { slug } = await props.params

  const found = channel(slug)

  if (!found) {
    return <Fallback code={StatusCodes.NOT_FOUND} text="フィードがみつからないみたい..." />
  }

  const response = await find(found.slug)

  if (!response) {
    return (
      <Fallback code={StatusCodes.INTERNAL_SERVER_ERROR} text="フィードとつながらないみたい..." />
    )
  }

  return <Feeds defaults={response} channel={found} />
}
