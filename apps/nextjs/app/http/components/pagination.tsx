import { Trigger } from '@kit/components'
import { equal } from '@kit/predicates'

export const Pagination = ({
  page,
  more,
  previous,
  next,
}: {
  page: number
  more: boolean
  previous: () => void
  next: () => void
}) => (
  <div className="flex justify-center gap-6 items-center mt-8">
    <Trigger kind="button" onClick={previous} disabled={equal(page, 1)}>
      ← 前へ
    </Trigger>
    <div className="px-6 py-2 bg-white border-4 border-gray-900 rounded-lg font-bold text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {page}
    </div>
    <Trigger kind="button" onClick={next} disabled={!more}>
      次へ →
    </Trigger>
  </div>
)
