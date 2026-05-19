import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ResultsTicker from '@/components/layout/ResultsTicker'
import DivisionTabs from '@/components/standings/DivisionTabs'
import ResultCard from '@/components/results/ResultCard'
import FixtureCard from '@/components/fixtures/FixtureCard'
import NewsCard from '@/components/news/NewsCard'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DMBB – Dublin Men\'s Basketball Board',
  description: 'Official website of the Dublin Men\'s Basketball Board – fixtures, results, standings and news.',
}

// ── Section title with amber left bar ────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-condensed font-black text-3xl uppercase text-white mb-8 border-l-[3px] border-[#F4A623] pl-4 py-1 leading-none">
      {children}
    </h2>
  )
}

export default async function HomePage() {
  const supabase = await createClient()

  // ── Existing queries (unchanged) ─────────────────────────────
  const { data: season } = await supabase
    .from('seasons')
    .select('id, name')
    .eq('is_current', true)
    .single()

  const { data: divisions } = await supabase
    .from('divisions')
    .select('id, name')
    .eq('season_id', season?.id ?? '')
    .order('display_order')

  const divisionsWithStandings = await Promise.all(
    (divisions ?? []).map(async (div) => {
      const { data: rows } = await supabase
        .from('standings')
        .select('team_id, played, won, lost, points_for, points_against, points, teams(name)')
        .eq('division_id', div.id)

      const standings = (rows ?? []).map((r: any) => ({
        team_id: r.team_id,
        team_name: r.teams?.name ?? '',
        played: r.played,
        won: r.won,
        lost: r.lost,
        points_for: r.points_for,
        points_against: r.points_against,
        points: r.points,
      }))

      return { id: div.id, name: div.name, standings }
    })
  )

  const { data: nextFixtures } = await supabase
    .from('fixtures')
    .select('id, scheduled_at, venue, status, home_team:home_team_id(name), away_team:away_team_id(name), division:division_id(name)')
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at')
    .limit(2)

  const { data: recentResults } = await supabase
    .from('fixtures')
    .select('id, scheduled_at, venue, home_team:home_team_id(name), away_team:away_team_id(name), division:division_id(name), results(home_score, away_score)')
    .eq('status', 'finished')
    .order('scheduled_at', { ascending: false })
    .limit(5)

  const { data: upcomingFixtures } = await supabase
    .from('fixtures')
    .select('id, scheduled_at, venue, status, home_team:home_team_id(name), away_team:away_team_id(name), division:division_id(name)')
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at')
    .limit(5)

  const { data: news } = await supabase
    .from('news')
    .select('title, slug, tag, published_at, body')
    .order('published_at', { ascending: false })
    .limit(4)

  // ── New: ticker (last 10 results) ────────────────────────────
  const { data: rawTicker } = await supabase
    .from('fixtures')
    .select('id, home_team:home_team_id(name), away_team:away_team_id(name), division:division_id(name), results(home_score, away_score)')
    .eq('status', 'finished')
    .order('scheduled_at', { ascending: false })
    .limit(10)

  const tickerResults = (rawTicker ?? []).flatMap((f: any) => {
    const r = Array.isArray(f.results) ? f.results[0] : f.results
    if (!r) return []
    return [{
      id: f.id,
      homeTeam: f.home_team?.name ?? '',
      awayTeam: f.away_team?.name ?? '',
      homeScore: r.home_score,
      awayScore: r.away_score,
      division: f.division?.name,
    }]
  })

  // ── New: cup finals ───────────────────────────────────────────
  const { data: cupDivisions } = await supabase
    .from('divisions')
    .select('id, name')
    .eq('season_id', season?.id ?? '')
    .or('name.ilike.%Cup%,name.ilike.%Final%,name.ilike.%Playoff%')

  let cupFinals: any[] = []
  if (cupDivisions?.length) {
    const { data: cf } = await supabase
      .from('fixtures')
      .select('id, scheduled_at, venue, home_team:home_team_id(name), away_team:away_team_id(name), division:division_id(name), results(home_score, away_score)')
      .in('division_id', cupDivisions.map((d: any) => d.id))
      .eq('status', 'finished')
      .order('scheduled_at', { ascending: false })
    cupFinals = (cf ?? []).filter((f: any) => {
      const r = Array.isArray(f.results) ? f.results[0] : f.results
      return r != null
    })
  }

  const nextGame = nextFixtures?.[0] as any

  return (
    <>
      <Navbar />
      <ResultsTicker results={tickerResults} />

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative bg-[#0a1628] py-20 lg:py-28 border-b border-white/8">

          {/* Subtle radial glow behind title */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 70% at 30% 50%, rgba(244,166,35,0.05) 0%, transparent 70%)',
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="relative">

              {/* ── Left: italic 3-line title ────────────────── */}
              <div className="relative pl-6 lg:max-w-[56%]">

                {/* Vertical amber accent */}
                <div
                  className="absolute left-0 top-1 bottom-1 rounded-full"
                  style={{ width: '3px', background: '#F4A623' }}
                />

                {/* Season badge */}
                <span
                  className="inline-block mb-5 px-3 py-1 rounded text-xs font-black uppercase tracking-widest"
                  style={{ background: '#F4A623', color: '#0a1628' }}
                >
                  {season?.name ?? '2025/26'} Season
                </span>

                {/* 3-line italic title */}
                <div className="font-condensed font-black italic uppercase leading-[0.88] mb-7 select-none">
                  <div className="text-5xl md:text-6xl lg:text-[4.5rem] text-white">
                    Dublin Men&apos;s
                  </div>
                  <div
                    className="text-6xl md:text-7xl lg:text-[6rem] text-stroke-amber"
                  >
                    Basketball
                  </div>
                  <div className="text-5xl md:text-6xl lg:text-[4.5rem] text-white">
                    Board
                  </div>
                </div>

                <p className="text-[#8899bb] text-base lg:text-lg mb-8 max-w-md not-italic">
                  Organising basketball leagues and cup competitions across Greater Dublin since 1968.
                </p>

                <div className="flex flex-wrap gap-3 not-italic">
                  <Link
                    href="/fixtures"
                    className="font-bold px-6 py-3 rounded transition-colors hover:bg-[#ffbc45]"
                    style={{ background: '#F4A623', color: '#0a1628' }}
                  >
                    View Fixtures
                  </Link>
                  <Link
                    href="/standings"
                    className="font-bold px-6 py-3 rounded border border-white/20 text-white hover:border-[#F4A623] hover:text-[#F4A623] transition-colors"
                  >
                    Standings
                  </Link>
                </div>
              </div>

              {/* ── Right: floating next-game card ───────────── */}
              <div className="mt-14 lg:mt-0 lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:w-[300px] w-full max-w-sm">
                {nextGame ? (
                  <div
                    className="rounded-xl border p-5"
                    style={{ background: '#111e33', borderColor: 'rgba(244,166,35,0.18)' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#F4A623' }}>
                        Next Game
                      </p>
                      {nextGame.division?.name && (
                        <span
                          className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded"
                          style={{ background: '#1a2d4a', color: '#8899bb' }}
                        >
                          {nextGame.division.name}
                        </span>
                      )}
                    </div>

                    {/* Teams vs score */}
                    <div className="grid grid-cols-[1fr_44px_1fr] items-center gap-2 mb-4">
                      <span className="font-condensed font-black text-white text-right text-sm leading-tight">
                        {nextGame.home_team?.name}
                      </span>
                      <div
                        className="flex items-center justify-center py-2 rounded"
                        style={{ background: '#0a1628' }}
                      >
                        <span className="font-condensed font-black text-xs tracking-widest" style={{ color: '#8899bb' }}>
                          VS
                        </span>
                      </div>
                      <span className="font-condensed font-black text-white text-left text-sm leading-tight">
                        {nextGame.away_team?.name}
                      </span>
                    </div>

                    {/* Date / time / venue */}
                    <div className="space-y-1">
                      <p className="text-xs font-semibold" style={{ color: '#c8d4e8' }}>
                        {new Date(nextGame.scheduled_at).toLocaleDateString('en-IE', {
                          weekday: 'short', day: 'numeric', month: 'short',
                        })}
                        {' · '}
                        {new Date(nextGame.scheduled_at).toLocaleTimeString('en-IE', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                      {nextGame.venue && (
                        <p className="text-xs truncate" style={{ color: '#556677' }}>
                          {nextGame.venue}
                        </p>
                      )}
                    </div>

                    <Link
                      href="/fixtures"
                      className="mt-4 block text-center text-xs font-bold py-2 rounded border border-white/10 hover:border-[#F4A623] hover:text-[#F4A623] transition-colors"
                      style={{ color: '#8899bb' }}
                    >
                      All Fixtures →
                    </Link>
                  </div>
                ) : (
                  <div
                    className="rounded-xl border p-5 text-center"
                    style={{ background: '#111e33', borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <p className="text-sm" style={{ color: '#556677' }}>No upcoming fixtures.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ── Cup Winners banner (only if data exists) ─────────── */}
        {cupFinals.length > 0 && (
          <section className="py-10 border-b border-white/8" style={{ background: '#070f1e' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionTitle>
                Cup <span className="text-[#F4A623]">Winners</span>
                <span className="ml-3 text-base font-black text-[#8899bb]">2025/26</span>
              </SectionTitle>
              <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none -mx-1 px-1">
                {cupFinals.map((f: any) => {
                  const r = Array.isArray(f.results) ? f.results[0] : f.results
                  const homeWin = r.home_score > r.away_score
                  return (
                    <div
                      key={f.id}
                      className="shrink-0 snap-start rounded-xl border p-5 w-72"
                      style={{ background: '#111e33', borderColor: 'rgba(244,166,35,0.2)' }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#F4A623' }}>
                        🏆 {f.division?.name}
                      </p>
                      <div className="grid grid-cols-[1fr_60px_1fr] items-center gap-2 mb-3">
                        <span className={`font-condensed font-black text-sm text-right leading-tight ${homeWin ? 'text-white' : 'text-[#8899bb]'}`}>
                          {f.home_team?.name}
                        </span>
                        <span
                          className="font-condensed font-black text-xl text-center tabular-nums"
                          style={{ color: '#F4A623' }}
                        >
                          {r.home_score}–{r.away_score}
                        </span>
                        <span className={`font-condensed font-black text-sm text-left leading-tight ${!homeWin ? 'text-white' : 'text-[#8899bb]'}`}>
                          {f.away_team?.name}
                        </span>
                      </div>
                      <p className="text-xs text-center" style={{ color: '#33445a' }}>
                        {new Date(f.scheduled_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {f.venue ? ` · ${f.venue}` : ''}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Standings ────────────────────────────────────────── */}
        <section className="py-14 border-b border-white/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle>
              League <span className="text-[#F4A623]">Standings</span>
            </SectionTitle>
            {divisionsWithStandings.length > 0 ? (
              <DivisionTabs divisions={divisionsWithStandings} />
            ) : (
              <p className="text-[#8899bb]">No standings data yet.</p>
            )}
          </div>
        </section>

        {/* ── Results + Upcoming ───────────────────────────────── */}
        <section className="py-14 border-b border-white/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-10">

              <div>
                <div className="flex items-center justify-between mb-6">
                  <SectionTitle>
                    Recent <span className="text-[#F4A623]">Results</span>
                  </SectionTitle>
                  <Link href="/results" className="text-[#F4A623] text-sm hover:underline mb-8">All results →</Link>
                </div>
                <div className="flex flex-col gap-3">
                  {(recentResults ?? []).map((f: any) => {
                    const r = Array.isArray(f.results) ? f.results[0] : f.results
                    if (!r) return null
                    return (
                      <ResultCard
                        key={f.id}
                        homeTeam={f.home_team?.name ?? ''}
                        awayTeam={f.away_team?.name ?? ''}
                        homeScore={r.home_score}
                        awayScore={r.away_score}
                        date={f.scheduled_at}
                        venue={f.venue}
                        division={f.division?.name}
                      />
                    )
                  })}
                  {(!recentResults || recentResults.length === 0) && (
                    <p className="text-[#8899bb] text-sm">No results yet.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <SectionTitle>
                    Upcoming <span className="text-[#F4A623]">Fixtures</span>
                  </SectionTitle>
                  <Link href="/fixtures" className="text-[#F4A623] text-sm hover:underline mb-8">All fixtures →</Link>
                </div>
                <div className="flex flex-col gap-3">
                  {(upcomingFixtures ?? []).map((f: any) => (
                    <FixtureCard
                      key={f.id}
                      id={f.id}
                      homeTeam={f.home_team?.name ?? ''}
                      awayTeam={f.away_team?.name ?? ''}
                      scheduledAt={f.scheduled_at}
                      venue={f.venue}
                      division={f.division?.name}
                      status={f.status}
                    />
                  ))}
                  {(!upcomingFixtures || upcomingFixtures.length === 0) && (
                    <p className="text-[#8899bb] text-sm">No upcoming fixtures.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── News ─────────────────────────────────────────────── */}
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <SectionTitle>
                Latest <span className="text-[#F4A623]">News</span>
              </SectionTitle>
              <Link href="/news" className="text-[#F4A623] text-sm hover:underline mb-8">All news →</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(news ?? []).map((n: any) => (
                <NewsCard
                  key={n.slug}
                  title={n.title}
                  slug={n.slug}
                  tag={n.tag}
                  publishedAt={n.published_at}
                  excerpt={n.body?.slice(0, 120)}
                />
              ))}
              {(!news || news.length === 0) && (
                <p className="text-[#8899bb] text-sm col-span-4">No news yet.</p>
              )}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
