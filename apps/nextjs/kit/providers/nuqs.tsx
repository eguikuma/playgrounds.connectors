'use client'

import type { PropsWithChildren } from 'react'

import { NuqsAdapter } from 'nuqs/adapters/next/app'

export const Nuqs = ({ children }: PropsWithChildren) => <NuqsAdapter>{children}</NuqsAdapter>
