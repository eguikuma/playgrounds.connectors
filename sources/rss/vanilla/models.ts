import type { DeepExact, ExtendedBase, GlobalOptions, Outcome } from '../../http/core/models'
import type { HttpVanillaGetSource } from '../../http/vanilla/models'
import type { Feed } from '../core/models'

export type RssVanillaGetSource<Base extends string> = HttpVanillaGetSource<Base, string>

export type RssVanillaMethods<Base extends string> = {
  get: (source: RssVanillaGetSource<Base>) => Promise<Outcome<Feed>>
}

export type RssVanillaBuilder<Base extends string> = RssVanillaMethods<Base> & {
  extend: <const Extended extends Partial<GlobalOptions>>(
    extended: DeepExact<Partial<GlobalOptions>, Extended>,
  ) => RssVanillaBuilder<ExtendedBase<Base, Extended>>
}
