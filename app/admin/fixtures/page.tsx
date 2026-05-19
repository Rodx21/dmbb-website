'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime } from '@/lib/utils'

export default function AdminFixturesPage() {
  const [fixtures, setFixtures] = useState<any[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    division_id: '',
    home_team_id: '',
    away_team_id: '',
    scheduled_at: '',
    venue: '',
  })

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: season } = await supabase.from('seasons').select('id').eq('is_current', true).single()
      const { data: divs } = await supabase.from('divisions').select('id, name').eq('season_id', season?.id ?? '').order('display_order')
      const { data: tms } = await supabase.from('teams').select('id, name').order('name')
      const { data: fx } = await supabase
        .from('fixtures')
        .select('id, scheduled_at, venue, status, home_team:home_team_id(name), away_team:away_team_id(name), division:division_id(name)')
        .order('scheduled_at', { ascending: false })
        .limit(30)

      setDivisions(divs ?? [])
      setTeams(tms ?? [])
      setFixtures(fx ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (form.home_team_id === form.away_team_id) {
      setMsg('Home and away teams must be different.')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('fixtures').insert({
      division_id: form.division_id,
      home_team_id: form.home_team_id,
      away_team_id: form.away_team_id,
      scheduled_at: form.scheduled_at,
      venue: form.venue || null,
      status: 'scheduled',
    })

    if (error) {
      setMsg(error.message)
    } else {
      setMsg('Fixture added!')
      setForm({ division_id: '', home_team_id: '', away_team_id: '', scheduled_at: '', venue: '' })
      const { data: fx } = await supabase
        .from('fixtures')
        .select('id, scheduled_at, venue, status, home_team:home_team_id(name), away_team:away_team_id(name), division:division_id(name)')
        .order('scheduled_at', { ascending: false })
        .limit(30)
      setFixtures(fx ?? [])
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this fixture?')) return
    await supabase.from('fixtures').delete().eq('id', id)
    setFixtures((p) => p.filter((f) => f.id !== id))
  }

  const inputCls = 'bg-[#0a1628] border border-white/8 text-white text-sm px-3 py-2 rounded focus:outline-none focus:border-[#F4A623] w-full'

  return (
    <div>
      <h1 className="font-condensed font-black text-3xl uppercase text-white mb-8">Fixtures</h1>

      {/* Add form */}
      <div className="bg-[#111e33] border border-white/8 rounded-lg p-6 mb-8">
        <h2 className="font-condensed font-black text-lg uppercase text-white mb-5">Add Fixture</h2>
        <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#8899bb] font-condensed uppercase tracking-widest">Division</label>
            <select required value={form.division_id} onChange={(e) => setForm((p) => ({ ...p, division_id: e.target.value }))} className={inputCls}>
              <option value="">Select…</option>
              {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#8899bb] font-condensed uppercase tracking-widest">Date & Time</label>
            <input required type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm((p) => ({ ...p, scheduled_at: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#8899bb] font-condensed uppercase tracking-widest">Home Team</label>
            <select required value={form.home_team_id} onChange={(e) => setForm((p) => ({ ...p, home_team_id: e.target.value }))} className={inputCls}>
              <option value="">Select…</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#8899bb] font-condensed uppercase tracking-widest">Away Team</label>
            <select required value={form.away_team_id} onChange={(e) => setForm((p) => ({ ...p, away_team_id: e.target.value }))} className={inputCls}>
              <option value="">Select…</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs text-[#8899bb] font-condensed uppercase tracking-widest">Venue (optional)</label>
            <input type="text" value={form.venue} onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))} className={inputCls} placeholder="e.g. National Basketball Arena" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-4">
            <button type="submit" disabled={saving} className="bg-[#F4A623] text-[#0a1628] font-black uppercase px-6 py-2.5 rounded hover:bg-[#ffbc45] transition-colors disabled:opacity-60">
              {saving ? 'Adding…' : 'Add Fixture'}
            </button>
            {msg && <span className={msg.includes('added') ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>{msg}</span>}
          </div>
        </form>
      </div>

      {/* List */}
      <h2 className="font-condensed font-black text-lg uppercase text-white mb-4">Recent Fixtures</h2>
      {loading ? <p className="text-[#8899bb]">Loading…</p> : (
        <div className="bg-[#111e33] border border-white/8 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a2d4a] text-[#8899bb] text-xs uppercase font-condensed tracking-widest">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Match</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Division</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {fixtures.map((f: any) => (
                <tr key={f.id} className="border-t border-white/8 hover:bg-white/5">
                  <td className="px-4 py-3 text-[#8899bb] whitespace-nowrap">{formatDate(f.scheduled_at)} {formatTime(f.scheduled_at)}</td>
                  <td className="px-4 py-3 text-white">{f.home_team?.name} vs {f.away_team?.name}</td>
                  <td className="px-4 py-3 text-[#8899bb] hidden md:table-cell">{f.division?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
                      f.status === 'finished' ? 'bg-green-500/20 text-green-400' :
                      f.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>{f.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(f.id)} className="text-red-400 hover:text-red-300 text-xs font-condensed uppercase">Delete</button>
                  </td>
                </tr>
              ))}
              {fixtures.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-[#8899bb]">No fixtures yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
