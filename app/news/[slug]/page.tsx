import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('news').select('title, body').eq('slug', slug).single()
  if (!data) return { title: 'News – DMBB' }
  return {
    title: `${data.title} – DMBB`,
    description: data.body?.slice(0, 160),
  }
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!article) notFound()

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/news" className="text-[#8899bb] hover:text-[#F4A623] text-sm mb-8 inline-flex items-center gap-2">
          ← Back to News
        </Link>

        <div className="mt-6">
          <span className="inline-block bg-[#F4A623] text-[#0a1628] text-xs font-black uppercase tracking-widest px-3 py-1 rounded mb-4">
            {article.tag}
          </span>
          <h1 className="font-condensed font-black text-4xl lg:text-5xl uppercase text-white leading-tight mb-3">
            {article.title}
          </h1>
          <p className="text-[#8899bb] text-sm mb-8">
            Published {formatDate(article.published_at)}
          </p>

          <div className="bg-[#111e33] border border-white/8 rounded-lg p-6 lg:p-8">
            <p className="text-white leading-relaxed whitespace-pre-wrap">{article.body}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
