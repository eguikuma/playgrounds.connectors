import {
  type DeepExact,
  type DefaultBase,
  type ExtendedBase,
  type GlobalOptions,
  instance,
  type Outcomer,
} from '@outcomify/requestify'

import type { HttpRestStandaloneConnector, HttpRestStandaloneMethods } from '../models/connector'

export const provide =
  (builder: <Base extends string>(outcomer: Outcomer<Base>) => HttpRestStandaloneMethods<Base>) =>
  <const Options extends Partial<GlobalOptions>>(
    options?: DeepExact<Partial<GlobalOptions>, Options>,
  ): HttpRestStandaloneConnector<ExtendedBase<DefaultBase, Options>> => {
    const build = <Base extends string>(outcomer: Outcomer<Base>) => ({
      ...builder(outcomer),
      extend: <const Extended extends Partial<GlobalOptions>>(
        extended: DeepExact<Partial<GlobalOptions>, Extended>,
      ) => build(outcomer.extend(extended)),
    })

    return build(instance(options))
  }
