import type { Outcome } from '@outcomify/requestify'
import type { HttpRestStandaloneGetSource } from '@outcomify/restify'

import type { Feed } from '../services/parse/models/parsed'

export type HttpRssStandaloneGet<Base extends string> = (
  source: HttpRssStandaloneGetSource<Base>,
) => Promise<Outcome<Feed>>

export type HttpRssStandaloneGetSource<Base extends string> = HttpRestStandaloneGetSource<
  Base,
  string
>
