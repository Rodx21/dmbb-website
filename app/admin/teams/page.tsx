'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Team = {
  id: string
  name: string
  short_name: string | null
  home_venue: string | null
  logo_url: string | null
}

function TeamAvatar({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="w-10 h-10 rounded object-contain"
        style={{ background: '#0a1628' }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }

  return (
    <div
      className="w-10 h-10 rounded flex items-center justify-center text-xs font-black"
      style={{ background: '#1a2d4a', color: '#F4A623' }}
    >
      {initials}
    </div>
  )
}

export default function AdminTeamsPage() {
  const supabase = createClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Team>>({})
  const [adding, setAdding] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', short_name: '', home_venue: '' })
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('teams')
      .select('id, name, short_name, home_venue, logo_url')
      .order('name')
    setTeams(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleLogoUpload(team: Team, file: File) {
    if (!file) return
    if (file.size > 524288) {
      showToast('File too large — max 512KB', false)
      return
    }

    setUploading(team.id)
    try {
      const ext = file.name.split('.').pop()
      const path = `${team.id}.${ext}`

      if (team.logo_url) {
        const oldPath = team.logo_url.split('/team-logos/')[1]
        if (oldPath) await supabase.storage.from('team-logos').remove([oldPath])
      }

      const { error: uploadError } = await supabase.storage
        .from('team-logos')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/team-logos/${path}`

      const { error: updateError } = await supabase
        .from('teams')
        .update({ logo_url: publicUrl })
        .eq('id', team.id)

      if (updateError) throw updateError

      showToast(`Logo updated for ${team.name}`)
      load()
    } catch (err: any) {
      showToast(err.message ?? 'Upload failed', false)
    } finally {
      setUploading(null)
    }
  }

  async function handleRemoveLogo(team: Team) {
    if (!team.logo_url) return
    setUploading(team.id)
    try {
      const path = team.logo_url.split('/team-logos/')[1]
      if (path) await supabase.storage.from('team-logos').remove([path])
      await supabase.from('teams').update({ logo_url: null }).eq('id', team.id)
      showToast('Logo removed')
      load()
    } catch (err: any) {
      showToast(err.message ?? 'Remove failed', false)
    } finally {
      setUploading(null)
    }
  }

  function startEdit(team: Team) {
    setEditId(team.id)
    setEditData({ name: team.name, short_name: team.short_name ?? '', home_venue: team.home_venue ?? '' })
  }

  async function saveEdit(team: Team) {
    setSaving(team.id)
    const { error } = await supabase
      .from('teams')
      .update({ name: editData.name, short_name: editData.short_name, home_venue: editData.home_venue })
      .eq('id', team.id)
    setSaving(null)
    if (error) { showToast(error.message, false); return }
    showToast('Team updated')
    setEditId(null)
    load()
  }

  async function handleAddTeam() {
    if (!newTeam.name.trim()) return
    setSaving('new')
    const { error } = await supabase.from('teams').insert({
      name: newTeam.name.trim(),
      short_name: newTeam.short_name.trim() || null,
      home_venue: newTeam.home_venue.trim() || null,
    })
    setSaving(null)
    if (error) { showToast(error.message, false); return }
    showToast('Team added')
    setAdding(false)
    setNewTeam({ name: '', short_name: '', home_venue: '' })
    load()
  }

  const inputCls = `w-full rounded px-3 py-2 text-sm text-white border border-white/10 focus:outline-none focus:border-amber-400`
  const inputStyle = { background: '#0a1628' }

  return (
    <div className="p-6 max-w-5xl">

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-semibold shadow-lg"
          style={{ background: toast.ok ? '#14532d' : '#7f1d1d', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {toast.ok ? '✓' : '✗'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-condensed font-black uppercase text-2xl text-white tracking-wide">
            Teams & <span style={{ color: '#F4A623' }}>Logos</span>
          </h1>
          <p className="text-xs mt-1" style={{ color: '#8899bb' }}>
            Manage club details and upload team logos (PNG/JPG/WebP/SVG, max 512KB)
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="px-4 py-2 rounded font-condensed font-black uppercase text-sm tracking-wide transition-colors"
          style={{ background: '#F4A623', color: '#0a1628' }}
        >
          + Add Team
        </button>
      </div>

      {/* Add team form */}
      {adding && (
        <div className="mb-6 rounded-lg border border-white/10 p-5" style={{ background: '#111e33' }}>
          <h2 className="font-condensed font-black uppercase text-white text-sm mb-4">New Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: '#8899bb' }}>Club Name *</label>
              <input className={inputCls} style={inputStyle} placeholder="e.g. Eanna BC"
                value={newTeam.name} onChange={e => setNewTeam(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#8899bb' }}>Short Name</label>
              <input className={inputCls} style={inputStyle} placeholder="e.g. Eanna"
                value={newTeam.short_name} onChange={e => setNewTeam(p => ({ ...p, short_name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: '#8899bb' }}>Home Venue</label>
              <input className={inputCls} style={inputStyle} placeholder="e.g. Colaiste Eanna"
                value={newTeam.home_venue} onChange={e => setNewTeam(p => ({ ...p, home_venue: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddTeam} disabled={saving === 'new'}
              className="px-4 py-2 rounded text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ background: '#F4A623', color: '#0a1628' }}>
              {saving === 'new' ? 'Saving…' : 'Save Team'}
            </button>
            <button onClick={() => setAdding(false)}
              className="px-4 py-2 rounded text-sm font-semibold border border-white/10"
              style={{ color: '#8899bb' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Teams table */}
      {loading ? (
        <div className="text-center py-20" style={{ color: '#8899bb' }}>Loading teams…</div>
      ) : (
        <div className="rounded-lg border border-white/8 overflow-hidden" style={{ background: '#111e33' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest font-black" style={{ color: '#8899bb' }}>Logo</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest font-black" style={{ color: '#8899bb' }}>Club</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest font-black hidden md:table-cell" style={{ color: '#8899bb' }}>Short</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest font-black hidden lg:table-cell" style={{ color: '#8899bb' }}>Home Venue</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest font-black" style={{ color: '#8899bb' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-white/2 transition-colors group">

                  {/* Logo cell */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TeamAvatar name={team.name} logoUrl={team.logo_url} />
                      <div className="flex flex-col gap-1">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="hidden"
                          ref={el => { fileRefs.current[team.id] = el }}
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) handleLogoUpload(team, file)
                            e.target.value = ''
                          }}
                        />
                        <button
                          onClick={() => fileRefs.current[team.id]?.click()}
                          disabled={uploading === team.id}
                          className="text-xs px-2 py-1 rounded transition-colors disabled:opacity-50"
                          style={{ background: '#1a2d4a', color: '#F4A623' }}
                        >
                          {uploading === team.id ? '⏳' : team.logo_url ? '↑ Replace' : '↑ Upload'}
                        </button>
                        {team.logo_url && (
                          <button
                            onClick={() => handleRemoveLogo(team)}
                            disabled={uploading === team.id}
                            className="text-xs px-2 py-1 rounded transition-colors disabled:opacity-50"
                            style={{ background: '#2a1a1a', color: '#ef4444' }}
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Name cell */}
                  <td className="px-4 py-3">
                    {editId === team.id ? (
                      <input
                        className={inputCls} style={{ ...inputStyle, width: '180px' }}
                        value={editData.name ?? ''}
                        onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                      />
                    ) : (
                      <span className="font-semibold text-white">{team.name}</span>
                    )}
                  </td>

                  {/* Short name */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    {editId === team.id ? (
                      <input
                        className={inputCls} style={{ ...inputStyle, width: '100px' }}
                        value={editData.short_name ?? ''}
                        onChange={e => setEditData(p => ({ ...p, short_name: e.target.value }))}
                      />
                    ) : (
                      <span style={{ color: '#8899bb' }}>{team.short_name ?? '—'}</span>
                    )}
                  </td>

                  {/* Venue */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {editId === team.id ? (
                      <input
                        className={inputCls} style={{ ...inputStyle, width: '220px' }}
                        value={editData.home_venue ?? ''}
                        onChange={e => setEditData(p => ({ ...p, home_venue: e.target.value }))}
                      />
                    ) : (
                      <span className="text-xs" style={{ color: '#8899bb' }}>{team.home_venue ?? '—'}</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {editId === team.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(team)}
                          disabled={saving === team.id}
                          className="text-xs px-3 py-1.5 rounded font-bold disabled:opacity-50"
                          style={{ background: '#F4A623', color: '#0a1628' }}
                        >
                          {saving === team.id ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="text-xs px-3 py-1.5 rounded border border-white/10"
                          style={{ color: '#8899bb' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(team)}
                        className="text-xs px-3 py-1.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: '#8899bb' }}
                      >
                        ✎ Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm" style={{ color: '#8899bb' }}>
                    No teams yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs" style={{ color: '#445' }}>
        Tip: logos appear on the /clubs page and next to team names throughout the site.
        Best results with square PNG or SVG files on a transparent or dark background.
      </p>
    </div>
  )
}
