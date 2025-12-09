'use client'

import { useInView } from 'react-intersection-observer'

import type { Feed } from '@outcomify/rssify'

import { Container, Head, Spinner, Trigger } from '@kit/components'

import { Card } from './card'
import { RssOptions } from '../integrations/options'
import { rss } from '../integrations/tanstack'
import type { ChannelCard } from '../models'

export const Feeds = ({ defaults, channel }: { defaults: Feed; channel: ChannelCard }) => {
  const {
    responses: { success },
    states: { more, paging },
    handlers: { next },
  } = rss.useInfinite({
    key: ['feeds', channel.slug],
    size: RssOptions.Limit,
    defaults,
  })

  const { ref } = useInView({
    onChange: (viewed) => viewed && more && !paging && next(),
  })

  const articles = success.flatMap((feed) => feed.data.entries)

  return (
    <Container>
      <Head>
        <Trigger kind="link" href="/rss">
          ← 戻る
        </Trigger>
      </Head>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <Card key={article.identifier || article.link || index} article={article} />
        ))}
      </div>
      {more && <div ref={ref}>{paging && <Spinner />}</div>}
    </Container>
  )
}
