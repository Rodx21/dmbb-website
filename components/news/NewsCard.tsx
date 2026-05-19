import Link from 'next/link'
import { formatDate } from '@/lib/utils'

type NewsCardProps = {
  title: string
  slug: string
  tag: string
  publishedAt: string
  excerpt?: string
}

export default function NewsCard({ title, slug, tag, publishedAt, excerpt }: NewsCardProps) {
  return (
    <Link
      href={`/news/${slug}`}
      className="bg-[#111e33] border border-white/8 rounded-lg p-5 flex flex-col gap-3 hover:border-[#F4A623]/40 hover:bg-[#1a2d4a] transition-all group"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="bg-[#F4A623] text-[#0a1628] text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
          {tag}
        </span>
        <span className="text-xs text-[#8899bb]">{formatDate(publishedAt)}</span>
      </div>
      <h3 className="font-condensed font-black text-white text-lg uppercase leading-tight group-hover:text-[#F4A623] transition-colors">
        {title}
      </h3>
      {excerpt && (
        <p className="text-sm text-[#8899bb] line-clamp-2">{excerpt}</p>
      )}
    </Link>
  )
}
