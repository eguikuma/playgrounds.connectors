import { StatusCodes } from 'http-status-codes'

import { Fallback, Feeds } from '../components'
import { channel, find } from '../services'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const found = channel(slug)

  if (!found) {
    return <Fallback code={StatusCodes.NOT_FOUND} text="フィードがみつからないみたい..." />
  }

  const response = await find(found.slug)

  if (!response.success) {
    return <Fallback code={response.status} text="フィードとつながらないみたい..." />
  }

  return <Feeds defaults={response.data} channel={found} />
}
