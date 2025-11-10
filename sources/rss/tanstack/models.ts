import type { DeepExact, ExtendedBase, GlobalOptions } from '../../http/core/models'
import type {
  HttpTanstackInfiniteQueryOutcome,
  HttpTanstackInfiniteQueryParameters,
  HttpTanstackInfiniteQuerySource,
  HttpTanstackQueryOutcome,
  HttpTanstackQueryParameters,
} from '../../http/tanstack/models'
import type { Feed, PagedFeed } from '../core/models'
import type { RssVanillaGetSource } from '../vanilla/models'

type RssTanstackMethods<Base extends string> = {
  get: (
    source: RssVanillaGetSource<Base>,
    parameters: HttpTanstackQueryParameters<Feed>,
  ) => HttpTanstackQueryOutcome<Feed>
  infinite: (
    source: HttpTanstackInfiniteQuerySource<Base, Feed>,
    parameters: HttpTanstackInfiniteQueryParameters<Feed> & { size: number },
  ) => HttpTanstackInfiniteQueryOutcome<PagedFeed>
}

export type RssTanstackBuilder<Base extends string> = RssTanstackMethods<Base> & {
  extend: <const Extended extends Partial<GlobalOptions>>(
    extended: DeepExact<Partial<GlobalOptions>, Extended>,
  ) => RssTanstackBuilder<ExtendedBase<Base, Extended>>
}
