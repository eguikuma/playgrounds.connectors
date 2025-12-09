'use client'

import { type FallbackProps, Fallback as Layout } from '@kit/components'

export const Fallback = ({ code, text }: Omit<FallbackProps, 'link'>) => (
  <Layout code={code} text={text} link={{ href: '/rss', label: '戻る' }}>
    <div className="relative">
      <svg
        viewBox="0 0 256 256"
        className="w-full h-full opacity-20 animate-float"
        role="img"
        aria-label="RSS icon"
      >
        <circle cx="68" cy="189" r="24" fill="#f97316" />
        <path d="M160 213h-34a82 82 0 0 0-82-82V97a116 116 0 0 1 116 116z" fill="#fb923c" />
        <path d="M184 213A140 140 0 0 0 44 73V32a181 181 0 0 1 181 181z" fill="#fdba74" />
      </svg>
    </div>
  </Layout>
)
