import type { ChannelCard } from '../models'

export const Channels: ChannelCard[] = [
  {
    slug: 'zenn',
    name: 'Zenn',
    url: 'https://zenn.dev/feed',
    description: 'エンジニアのための技術情報共有サービス',
  },
  {
    slug: 'sbbit',
    name: 'ビジネス+IT',
    url: 'https://www.sbbit.jp/rss/HotTopics.rss',
    description: 'IT×ビジネスの最新トピックス',
  },
  {
    slug: 'hatena',
    name: 'はてなブックマーク',
    url: 'https://b.hatena.ne.jp/hotentry/all.rss',
    description: '人気エントリー - 総合',
  },
  {
    slug: 'ascii',
    name: 'ASCII.jp',
    url: 'https://ascii.jp/rss.xml',
    description: 'テクノロジー＆ライフスタイルニュース',
  },
  {
    slug: 'gizmodo',
    name: 'ギズモード・ジャパン',
    url: 'https://www.gizmodo.jp/index.xml',
    description: '最新ガジェット＆テクノロジー情報',
  },
  {
    slug: 'lifehacker',
    name: 'ライフハッカー・ジャパン',
    url: 'https://www.lifehacker.jp/feed/index.xml',
    description: '仕事術＆ライフスタイルマガジン',
  },
]

export const channel = (slug: string) => Channels.find((channel) => channel.slug === slug)
