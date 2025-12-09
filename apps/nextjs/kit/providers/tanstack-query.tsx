'use client'

import { type PropsWithChildren, useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const TanstackQuery = ({ children }: PropsWithChildren) => {
  const [client] = useState(() => new QueryClient())

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
