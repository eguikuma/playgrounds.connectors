'use client'

import Link from 'next/link'

import { Container, Head, Title } from '@kit/components'

import { Channels } from '../services'

export const Sources = () => (
  <Container>
    <Head>
      <Title className="bg-linear-to-r from-amber-400 via-amber-600 to-amber-800 text-white">
        RSS
      </Title>
    </Head>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Channels.map((channel) => (
        <Link
          key={channel.slug}
          href={`/rss/${channel.slug}`}
          className="block bg-linear-to-br from-white to-orange-50 border-4 border-gray-900 rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.8)] hover:-translate-y-2 hover:-translate-x-1 transform transition-all duration-200 h-full"
        >
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-linear-to-br from-orange-400 to-amber-500 rounded-full border-3 border-gray-900 flex items-center justify-center">
                  <svg viewBox="0 0 256 256" className="w-10 h-10" role="img" aria-label="RSS icon">
                    <circle cx="68" cy="189" r="24" fill="white" />
                    <path
                      d="M160 213h-34a82 82 0 0 0-82-82V97a116 116 0 0 1 116 116z"
                      fill="white"
                    />
                    <path d="M184 213A140 140 0 0 0 44 73V32a181 181 0 0 1 181 181z" fill="white" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{channel.name}</h3>
              <p className="text-sm text-gray-600 text-center line-clamp-2">
                {channel.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </Container>
)
