import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { toJa } from '@kit/formatters'

import type { ArticleCard } from '../models'

export const Card = ({ article }: { article: ArticleCard }) => {
  const published = article.published ? toJa(article.published) : null

  return (
    <Link
      href={(article.link || '#') as Route}
      target="_blank"
      rel="noopener noreferrer"
      title={article.title || 'タイトルなし'}
      className="flex bg-linear-to-br from-white to-orange-50 border-4 border-gray-900 rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.8)] hover:-translate-y-2 hover:-translate-x-1 transform transition-all duration-200 h-full flex-col"
    >
      <div className="relative w-full h-48 bg-linear-to-br from-orange-100 to-amber-100 flex items-center justify-center border-b-4 border-gray-900">
        {article.thumbnail ? (
          <Image
            src={article.thumbnail}
            alt={article.title || '記事のサムネイル'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <svg
            viewBox="0 0 256 256"
            className="w-20 h-20 opacity-30"
            role="img"
            aria-label="RSS icon"
          >
            <circle cx="68" cy="189" r="24" fill="#f97316" />
            <path d="M160 213h-34a82 82 0 0 0-82-82V97a116 116 0 0 1 116 116z" fill="#fb923c" />
            <path d="M184 213A140 140 0 0 0 44 73V32a181 181 0 0 1 181 181z" fill="#fdba74" />
          </svg>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
          {article.title || ''}
        </h3>
        {article.description && (
          <p className="text-sm text-gray-600 line-clamp-3">{article.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
          {published && <span>{published}</span>}
          {article.creator && <span className="truncate ml-2">{article.creator}</span>}
        </div>
      </div>
    </Link>
  )
}
