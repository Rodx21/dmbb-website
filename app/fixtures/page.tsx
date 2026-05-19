'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FixturesList from '@/components/fixtures/FixturesList'

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<any[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [selectedDivision, setSelectedDivision] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
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
        .select('id, scheduled_at, venue, status, home_team:home_team_id(name), away_team:away_team_id(name), division:division_id(name, id), results(home_score, away_score)')
        .order('scheduled_at')

      if (selectedDivision) query = query.eq('division_id', selectedDivision)
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-')
        const from = `${year}-${month}-01`
        const to = `${year}-${month}-31`
        query = query.gte('scheduled_at', from).lte('scheduled_at', to)
      }

      const { data } = await query
      setFixtures(
        (data ?? []).map((f: any) => ({
          ...f,
          result: f.results?.[0] ?? null,
        }))
      )
      setLoading(false)
    }

    load()
  }, [selectedDivision, selectedMonth])

  const months = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(2025, 8 + i, 1)
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' }),
    }
  })

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-condensed font-black text-4xl uppercase text-white mb-8">
          Fixtures
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
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

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#111e33] border border-white/8 text-white text-sm px-4 py-2 rounded focus:outline-none focus:border-[#F4A623]"
          >
            <option value="">All Months</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-[#8899bb]">Loading…</p>
        ) : (
          <FixturesList fixtures={fixtures} />
        )}
      </main>
      <Footer />
    </>
  )
}
