import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StatsLeaderboard from '@/components/stats/StatsLeaderboard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stats – DMBB',
  description: 'Season top scorers and player statistics for the Dublin Men\'s Basketball Board.',
}

export default async function StatsPage() {
  const supabase = await createClient()

  const { data: season } = await supabase
    .from('seasons')
    .select('id, name')
    .eq('is_current', true)
    .single()

  const { data: rows } = await supabase
    .from('top_scorers_by_division')
    .select('*')
    .order('avg_points', { ascending: false })

  const divisionMap: Record<string, { id: string; name: string; leaders: any[] }> = {}

  for (const row of rows ?? []) {
    if (!divisionMap[row.division_id]) {
      divisionMap[row.division_id] = {
        id: row.division_id,
        name: row.division_name,
        leaders: [],
      }
    }
    if (divisionMap[row.division_id].leaders.length < 20) {
      divisionMap[row.division_id].leaders.push({
        playerId: row.player_id,
        playerName: row.player_name,
        teamName: row.team_name,
        games: Number(row.games_played),
        totalPoints: Number(row.total_points),
        avgPoints: Number(row.avg_points),
      })
    }
  }

  const { data: divOrder } = await supabase
    .from('divisions')
    .select('id, display_order')
    .eq('season_id', season?.id ?? '')

  const orderMap: Record<string, number> = {}
  for (const d of divOrder ?? []) orderMap[d.id] = d.display_order

  const divisionsWithStats = Object.values(divisionMap)
    .filter(d => d.leaders.length > 0)
    .sort((a, b) => (orderMap[a.id] ?? 99) - (orderMap[b.id] ?? 99))

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="font-condensed font-black text-4xl uppercase text-white">
            Season <span className="text-[#F4A623]">Stats</span>
          </h1>
          {season && <p className="text-[#8899bb] text-sm mt-1">Season {season.name} · Top Scorers by Division</p>}
        </div>

        {divisionsWithStats.length === 0 ? (
          <div className="bg-[#111e33] border border-white/8 rounded-lg p-8 text-center">
            <p className="text-[#8899bb] text-lg font-condensed font-black uppercase">No stats available yet</p>
            <p className="text-[#8899bb] text-sm mt-2">Player statistics will appear here after games are played.</p>
          </div>
        ) : (
          <StatsLeaderboard divisions={divisionsWithStats} />
        )}
      </main>
      <Footer />
    </>
  )
}
