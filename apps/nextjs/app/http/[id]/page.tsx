import { StatusCodes } from 'http-status-codes'

import { Fallback, Profile } from '../components'
import { find } from '../services'

export default async function Page(props: PageProps<'/http/[id]'>) {
  const { id } = await props.params
  const response = await find(id)

  if (!response) {
    return <Fallback code={StatusCodes.NOT_FOUND} text="ポケモンがみつからないみたい..." />
  }

  return <Profile defaults={response} />
}
