'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ResultCard from '@/components/results/ResultCard'

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [selectedDivision, setSelectedDivision] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: season } = await supabase
        .from('seasons')
        .select('id')
        .eq('is_current', true)
        .single()

      const { data: divs } = await supabase
        .from('divisions')
        .select('id, name')
        .eq('season_id', season?.id ?? '')
        .order('display_order')

      setDivisions(divs ?? [])

      let query = supabase
        .from('fixtures')
        .select('id, scheduled_at, venue, home_team:home_team_id(name), away_team:away_team_id(name), division:division_id(name, id), results(home_score, away_score)')
        .eq('status', 'finished')
        .order('scheduled_at', { ascending: false })

      if (selectedDivision) query = query.eq('division_id', selectedDivision)

      const { data } = await query
      setResults(data ?? [])
      setLoading(false)
    }

    load()
  }, [selectedDivision])

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-condensed font-black text-4xl uppercase text-white mb-8">Results</h1>

        <div className="mb-8">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="bg-[#111e33] border border-white/8 text-white text-sm px-4 py-2 rounded focus:outline-none focus:border-[#F4A623]"
          >
            <option value="">All Divisions</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-[#8899bb]">Loading…</p>
        ) : results.length === 0 ? (
          <p className="text-[#8899bb]">No results yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {results.map((f: any) => {
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
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
