'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminPlayersPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('teams').select('id, name').order('name').then(({ data }) => setTeams(data ?? []))
  }, [])

  useEffect(() => {
    if (!selectedTeam) { setPlayers([]); return }
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('players')
      .select('id, name, number')
      .eq('team_id', selectedTeam)
      .order('number', { ascending: true, nullsFirst: false })
      .then(({ data }) => { setPlayers(data ?? []); setLoading(false) })
  }, [selectedTeam])

  async function addPlayer() {
    if (!selectedTeam || !newName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('players')
      .insert({ team_id: selectedTeam, name: newName.trim(), number: newNumber ? parseInt(newNumber) : null })
      .select()
      .single()
    if (data) setPlayers(p => [...p, data].sort((a, b) => (a.number ?? 999) - (b.number ?? 999)))
    setNewName('')
    setNewNumber('')
    setSaving(false)
  }

  async function deletePlayer(id: string) {
    const supabase = createClient()
    await supabase.from('players').delete().eq('id', id)
    setPlayers(p => p.filter(pl => pl.id !== id))
  }

  return (
    <div>
      <h1 className="font-condensed font-black text-3xl uppercase text-white mb-2">Players</h1>
      <p className="text-[#8899bb] text-sm mb-6">Manage players per team. Registered players can be linked to game statistics.</p>

      <div className="mb-6">
        <select
          value={selectedTeam}
          onChange={e => setSelectedTeam(e.target.value)}
          className="bg-[#111e33] border border-white/8 text-white text-sm px-4 py-2 rounded focus:outline-none focus:border-[#F4A623]"
        >
          <option value="">Select a team…</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {selectedTeam && (
        <>
          <div className="bg-[#111e33] border border-white/8 rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-[#8899bb] uppercase tracking-widest mb-1">Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPlayer()}
                placeholder="Player name"
                className="bg-[#0a1628] border border-white/8 text-white text-sm px-3 py-2 rounded w-52 focus:outline-none focus:border-[#F4A623]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8899bb] uppercase tracking-widest mb-1">Jersey #</label>
              <input
                type="number"
                value={newNumber}
                onChange={e => setNewNumber(e.target.value)}
                placeholder="—"
                className="bg-[#0a1628] border border-white/8 text-white text-sm px-3 py-2 rounded w-20 focus:outline-none focus:border-[#F4A623]"
              />
            </div>
            <button
              onClick={addPlayer}
              disabled={saving || !newName.trim()}
              className="bg-[#F4A623] text-[#0a1628] font-black uppercase text-sm px-5 py-2 rounded hover:bg-[#ffbc45] transition-colors disabled:opacity-60"
            >
              {saving ? '…' : 'Add Player'}
            </button>
          </div>

          {loading ? (
            <p className="text-[#8899bb]">Loading…</p>
          ) : players.length === 0 ? (
            <p className="text-[#8899bb] text-sm">No players registered for this team.</p>
          ) : (
            <div className="bg-[#111e33] border border-white/8 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left px-4 py-3 text-[#8899bb] font-condensed font-black uppercase text-xs tracking-widest w-16">#</th>
                    <th className="text-left px-4 py-3 text-[#8899bb] font-condensed font-black uppercase text-xs tracking-widest">Name</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(pl => (
                    <tr key={pl.id} className="border-b border-white/5">
                      <td className="px-4 py-3 text-[#8899bb] font-condensed font-black">{pl.number ?? '—'}</td>
                      <td className="px-4 py-3 text-white font-condensed font-black">{pl.name}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deletePlayer(pl.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-black uppercase"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
