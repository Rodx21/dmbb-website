import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DivisionTabs from '@/components/standings/DivisionTabs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Standings – DMBB',
  description: 'League standings for all divisions in the Dublin Men\'s Basketball Board.',
}

export default async function StandingsPage() {
  const supabase = await createClient()

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

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="font-condensed font-black text-4xl uppercase text-white">
            League <span className="text-[#F4A623]">Standings</span>
          </h1>
          {season && (
            <p className="text-[#8899bb] text-sm mt-1">Season {season.name}</p>
          )}
        </div>

        {divisionsWithStandings.length > 0 ? (
          <>
            <DivisionTabs divisions={divisionsWithStandings} />
            <div className="mt-6 flex gap-6 text-xs text-[#8899bb]">
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-sm" /> Promotion zone
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-sm" /> Relegation zone
              </span>
            </div>
          </>
        ) : (
          <p className="text-[#8899bb]">No standings data yet.</p>
        )}
      </main>
      <Footer />
    </>
  )
}
