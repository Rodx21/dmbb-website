import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clubs – DMBB',
  description: 'All clubs competing in the Dublin Men\'s Basketball Board leagues.',
}

export default async function ClubsPage() {
  const supabase = await createClient()

  const { data: season } = await supabase
    .from('seasons')
    .select('id')
    .eq('is_current', true)
    .single()

  const { data: teamDivisions } = await supabase
    .from('team_divisions')
    .select('teams(id, name, home_venue), divisions(id, name, season_id)')

  const clubs = (teamDivisions ?? [])
    .filter((td: any) => td.divisions?.season_id === season?.id)
    .map((td: any) => ({
      id: td.teams?.id,
      name: td.teams?.name ?? '',
      home_venue: td.teams?.home_venue ?? '',
      division: td.divisions?.name ?? '',
    }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

  const unique = clubs.filter(
    (c: any, i: number, arr: any[]) => arr.findIndex((x) => x.id === c.id && x.division === c.division) === i
  )

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-condensed font-black text-4xl uppercase text-white mb-8">
          Member <span className="text-[#F4A623]">Clubs</span>
        </h1>

        {unique.length === 0 ? (
          <p className="text-[#8899bb]">No clubs registered yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unique.map((club: any) => (
              <div
                key={`${club.id}-${club.division}`}
                className="bg-[#111e33] border border-white/8 rounded-lg p-5 hover:border-[#F4A623]/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#1a2d4a] flex items-center justify-center mb-4">
                  <span className="font-condensed font-black text-[#F4A623] text-lg">
                    {club.name.charAt(0)}
                  </span>
                </div>
                <h2 className="font-condensed font-black text-white text-xl uppercase mb-1">
                  {club.name}
                </h2>
                <span className="inline-block bg-[#F4A623] text-[#0a1628] text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded mb-3">
                  {club.division}
                </span>
                {club.home_venue && (
                  <p className="text-sm text-[#8899bb] flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {club.home_venue}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
