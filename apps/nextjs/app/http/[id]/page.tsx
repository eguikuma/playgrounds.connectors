import { Fallback, Profile } from '../components'
import { find } from '../services'

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { id } = await params
  const { page } = await searchParams
  const current = Math.max(1, Number(page) || 1)
  const response = await find(id)

  if (!response.success) {
    return <Fallback code={response.status} text="ポケモンセンターとつながらないみたい..." />
  }

  return <Profile profile={response.data} page={current} />
}
