import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import NewsCard from '@/components/news/NewsCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'News – DMBB',
  description: 'Latest news and announcements from the Dublin Men\'s Basketball Board.',
}

export default async function NewsPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('news')
    .select('title, slug, tag, published_at, body')
    .order('published_at', { ascending: false })

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-condensed font-black text-4xl uppercase text-white mb-8">
          Latest <span className="text-[#F4A623]">News</span>
        </h1>

        {(!articles || articles.length === 0) ? (
          <p className="text-[#8899bb]">No news yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((n: any) => (
              <NewsCard
                key={n.slug}
                title={n.title}
                slug={n.slug}
                tag={n.tag}
                publishedAt={n.published_at}
                excerpt={n.body?.slice(0, 140)}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
