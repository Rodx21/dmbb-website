'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

export default function AdminResultsPage() {
  const [fixtures, setFixtures] = useState<any[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [selectedDiv, setSelectedDiv] = useState('')
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [statsOpen, setStatsOpen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: season } = await supabase.from('seasons').select('id').eq('is_current', true).single()
      const { data: divs } = await supabase.from('divisions').select('id, name').eq('season_id', season?.id ?? '').order('display_order')
      setDivisions(divs ?? [])

      let q = supabase
        .from('fixtures')
        .select('id, scheduled_at, venue, status, division_id, home_team_id, away_team_id, home_team:home_team_id(id, name), away_team:away_team_id(id, name), division:division_id(name), results(home_score, away_score)')
        .in('status', ['scheduled', 'finished'])
        .order('scheduled_at')

      if (selectedDiv) q = q.eq('division_id', selectedDiv)

      const { data } = await q
      setFixtures(data ?? [])
      setLoading(false)
    }
    load()
  }, [selectedDiv])

  async function saveResult(fixture: any) {
    const s = scores[fixture.id]
    if (!s || s.home === '' || s.away === '') return

    setSaving(p => ({ ...p, [fixture.id]: true }))
    const home_score = parseInt(s.home)
    const away_score = parseInt(s.away)
    const supabase = createClient()
    const existing = Array.isArray(fixture.results) ? fixture.results[0] : fixture.results

    if (existing) {
      await supabase.from('results').update({ home_score, away_score }).eq('fixture_id', fixture.id)
    } else {
      await supabase.from('results').insert({ fixture_id: fixture.id, home_score, away_score })
    }

    await supabase.from('fixtures').update({ status: 'finished' }).eq('id', fixture.id)
    await supabase.rpc('recalculate_standings', { p_division_id: fixture.division_id })

    setMessages(p => ({ ...p, [fixture.id]: 'Saved!' }))
    setTimeout(() => setMessages(p => ({ ...p, [fixture.id]: '' })), 2000)
    setSaving(p => ({ ...p, [fixture.id]: false }))
    setFixtures(prev => prev.map(f =>
      f.id === fixture.id ? { ...f, status: 'finished', results: { home_score, away_score } } : f
    ))
  }

  return (
    <div>
      <h1 className="font-condensed font-black text-3xl uppercase text-white mb-6">Enter Results</h1>

      <div className="mb-6">
        <select
          value={selectedDiv}
          onChange={e => setSelectedDiv(e.target.value)}
          className="bg-[#111e33] border border-white/8 text-white text-sm px-4 py-2 rounded focus:outline-none focus:border-[#F4A623]"
        >
          <option value="">All Divisions</option>
          {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {loading ? <p className="text-[#8899bb]">Loading…</p> : (
        <div className="flex flex-col gap-4">
          {fixtures.map((f: any) => {
            const existing = Array.isArray(f.results) ? f.results[0] : f.results
            const cur = scores[f.id] ?? {
              home: existing?.home_score?.toString() ?? '',
              away: existing?.away_score?.toString() ?? '',
            }

            return (
              <div key={f.id} className="bg-[#111e33] border border-white/8 rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-4 justify-between">
                    <div>
                      <p className="text-xs text-[#8899bb] mb-1">{formatDate(f.scheduled_at)} · {f.division?.name}</p>
                      <p className="font-condensed font-black text-white text-lg">
                        {f.home_team?.name} <span className="text-[#8899bb]">vs</span> {f.away_team?.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number" min="0" placeholder="0" value={cur.home}
                        onChange={e => setScores(p => ({ ...p, [f.id]: { ...cur, home: e.target.value } }))}
                        className="w-16 bg-[#0a1628] border border-white/8 text-white text-center py-2 rounded font-condensed font-black text-xl focus:outline-none focus:border-[#F4A623]"
                      />
                      <span className="text-[#8899bb] font-condensed font-black">–</span>
                      <input
                        type="number" min="0" placeholder="0" value={cur.away}
                        onChange={e => setScores(p => ({ ...p, [f.id]: { ...cur, away: e.target.value } }))}
                        className="w-16 bg-[#0a1628] border border-white/8 text-white text-center py-2 rounded font-condensed font-black text-xl focus:outline-none focus:border-[#F4A623]"
                      />
                      <button
                        onClick={() => saveResult({ ...f })}
                        disabled={saving[f.id]}
                        className="bg-[#F4A623] text-[#0a1628] font-black uppercase text-sm px-4 py-2 rounded hover:bg-[#ffbc45] transition-colors disabled:opacity-60"
                      >
                        {saving[f.id] ? '…' : 'Save'}
                      </button>
                      {messages[f.id] && <span className="text-green-400 text-sm font-condensed">{messages[f.id]}</span>}
                    </div>
                  </div>

                  {f.status === 'finished' && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-xs bg-green-500/20 text-green-400 font-black uppercase px-2 py-0.5 rounded">Finished</span>
                      <button
                        onClick={() => setStatsOpen(p => ({ ...p, [f.id]: !p[f.id] }))}
                        className="text-xs text-[#F4A623] hover:text-[#ffbc45] font-black uppercase tracking-widest"
                      >
                        {statsOpen[f.id] ? '▲ Close Stats' : '▼ Add Player Stats'}
                      </button>
                    </div>
                  )}
                </div>

                {statsOpen[f.id] && (
                  <PlayerStatsEntry
                    fixtureId={f.id}
                    homeTeam={{ id: f.home_team?.id ?? f.home_team_id, name: f.home_team?.name }}
                    awayTeam={{ id: f.away_team?.id ?? f.away_team_id, name: f.away_team?.name }}
                  />
                )}
              </div>
            )
          })}
          {fixtures.length === 0 && <p className="text-[#8899bb]">No fixtures found.</p>}
        </div>
      )}
    </div>
  )
}

function PlayerStatsEntry({ fixtureId, homeTeam, awayTeam }: {
  fixtureId: string
  homeTeam: { id: string; name: string }
  awayTeam: { id: string; name: string }
}) {
  const [homePlayers, setHomePlayers] = useState<any[]>([])
  const [awayPlayers, setAwayPlayers] = useState<any[]>([])
  const [existingStats, setExistingStats] = useState<Record<string, number>>({})
  const [pts, setPts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const [{ data: hp }, { data: ap }, { data: stats }] = await Promise.all([
        supabase.from('players').select('id, name, number').eq('team_id', homeTeam.id).order('number', { ascending: true, nullsFirst: false }),
        supabase.from('players').select('id, name, number').eq('team_id', awayTeam.id).order('number', { ascending: true, nullsFirst: false }),
        supabase.from('player_stats').select('player_id, points').eq('fixture_id', fixtureId),
      ])
      setHomePlayers(hp ?? [])
      setAwayPlayers(ap ?? [])
      const existing: Record<string, number> = {}
      const initialPts: Record<string, string> = {};
      (stats ?? []).forEach((s: any) => {
        existing[s.player_id] = s.points
        initialPts[s.player_id] = s.points.toString()
      })
      setExistingStats(existing)
      setPts(initialPts)
      setLoading(false)
    }
    load()
  }, [fixtureId, homeTeam.id, awayTeam.id])

  async function saveStats() {
    setSaving(true)
    const supabase = createClient()
    const allPlayers = [
      ...homePlayers.map((p: any) => ({ ...p, teamId: homeTeam.id })),
      ...awayPlayers.map((p: any) => ({ ...p, teamId: awayTeam.id })),
    ]

    for (const player of allPlayers) {
      const val = pts[player.id]
      if (val === undefined || val === '') continue
      const points = parseInt(val) || 0
      if (existingStats[player.id] !== undefined) {
        await supabase.from('player_stats').update({ points }).eq('fixture_id', fixtureId).eq('player_id', player.id)
      } else {
        await supabase.from('player_stats').insert({ fixture_id: fixtureId, player_id: player.id, team_id: player.teamId, points })
      }
      setExistingStats(p => ({ ...p, [player.id]: points }))
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="px-4 pb-4 text-[#8899bb] text-sm">Loading players…</div>

  return (
    <div className="border-t border-white/8 bg-[#0a1628] p-4">
      <h3 className="font-condensed font-black text-sm uppercase text-[#8899bb] tracking-widest mb-4">
        Player Scoring
      </h3>

      {homePlayers.length === 0 && awayPlayers.length === 0 ? (
        <p className="text-[#8899bb] text-sm">
          No players registered for these teams.{' '}
          <a href="/admin/players" className="text-[#F4A623] hover:underline">Add players →</a>
        </p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <TeamStatCol
              teamName={homeTeam.name}
              players={homePlayers}
              pts={pts}
              onChange={(id, val) => setPts(p => ({ ...p, [id]: val }))}
            />
            <TeamStatCol
              teamName={awayTeam.name}
              players={awayPlayers}
              pts={pts}
              onChange={(id, val) => setPts(p => ({ ...p, [id]: val }))}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveStats}
              disabled={saving}
              className="bg-[#F4A623] text-[#0a1628] font-black uppercase text-sm px-5 py-2 rounded hover:bg-[#ffbc45] transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Stats'}
            </button>
            {saved && <span className="text-green-400 text-sm font-condensed">Saved!</span>}
          </div>
        </>
      )}
    </div>
  )
}

function TeamStatCol({ teamName, players, pts, onChange }: {
  teamName: string
  players: any[]
  pts: Record<string, string>
  onChange: (id: string, val: string) => void
}) {
  return (
    <div>
      <p className="font-condensed font-black text-white text-sm uppercase tracking-widest mb-2">{teamName}</p>
      {players.length === 0 ? (
        <p className="text-[#8899bb] text-xs">No players. <a href="/admin/players" className="text-[#F4A623] hover:underline">Add →</a></p>
      ) : (
        <div className="flex flex-col gap-1">
          {players.map(pl => (
            <div key={pl.id} className="flex items-center gap-2">
              <span className="text-[#8899bb] text-xs w-6 text-right shrink-0">{pl.number ?? '—'}</span>
              <span className="text-white text-sm flex-1 truncate">{pl.name}</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={pts[pl.id] ?? ''}
                onChange={e => onChange(pl.id, e.target.value)}
                className="w-14 bg-[#111e33] border border-white/8 text-white text-center py-1 rounded font-condensed font-black text-sm focus:outline-none focus:border-[#F4A623]"
              />
              <span className="text-[#8899bb] text-xs">pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
