'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { slugify, formatDate } from '@/lib/utils'

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', tag: 'News', body: '', published_at: '' })

  useEffect(() => { loadArticles() }, [])

  async function loadArticles() {
    const supabase = createClient()
    const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false })
    setArticles(data ?? [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()

    const payload = {
      title: form.title,
      tag: form.tag,
      body: form.body,
      published_at: form.published_at || new Date().toISOString(),
      ...(!editId && { slug: slugify(form.title) }),
    }

    if (editId) {
      const { error } = await supabase.from('news').update(payload).eq('id', editId)
      if (error) setMsg(error.message)
      else { setMsg('Article updated!'); setEditId(null); setForm({ title: '', tag: 'News', body: '', published_at: '' }) }
    } else {
      const { error } = await supabase.from('news').insert(payload)
      if (error) setMsg(error.message)
      else { setMsg('Article published!'); setForm({ title: '', tag: 'News', body: '', published_at: '' }) }
    }

    await loadArticles()
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this article?')) return
    const supabase = createClient()
    await supabase.from('news').delete().eq('id', id)
    setArticles((p) => p.filter((a) => a.id !== id))
  }

  function startEdit(a: any) {
    setEditId(a.id)
    setForm({
      title: a.title,
      tag: a.tag,
      body: a.body,
      published_at: a.published_at?.slice(0, 16) ?? '',
    })
  }

  const inputCls = 'bg-[#0a1628] border border-white/8 text-white text-sm px-3 py-2 rounded focus:outline-none focus:border-[#F4A623] w-full'

  return (
    <div>
      <h1 className="font-condensed font-black text-3xl uppercase text-white mb-8">News</h1>

      <div className="bg-[#111e33] border border-white/8 rounded-lg p-6 mb-8">
        <h2 className="font-condensed font-black text-lg uppercase text-white mb-5">
          {editId ? 'Edit Article' : 'New Article'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8899bb] font-condensed uppercase tracking-widest">Title</label>
              <input required type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#8899bb] font-condensed uppercase tracking-widest">Tag</label>
              <select value={form.tag} onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))} className={inputCls}>
                {['News', 'Announcement', 'Season', 'Cup', 'Registration', 'Cup Final', 'Fixtures'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#8899bb] font-condensed uppercase tracking-widest">Publish Date</label>
            <input type="datetime-local" value={form.published_at} onChange={(e) => setForm((p) => ({ ...p, published_at: e.target.value }))} className={`${inputCls} sm:w-64`} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#8899bb] font-condensed uppercase tracking-widest">Body</label>
            <textarea
              required
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              rows={8}
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving} className="bg-[#F4A623] text-[#0a1628] font-black uppercase px-6 py-2.5 rounded hover:bg-[#ffbc45] transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : editId ? 'Update' : 'Publish'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ title: '', tag: 'News', body: '', published_at: '' }) }} className="text-[#8899bb] hover:text-white text-sm">Cancel</button>
            )}
            {msg && <span className={msg.includes('error') ? 'text-red-400 text-sm' : 'text-green-400 text-sm'}>{msg}</span>}
          </div>
        </form>
      </div>

      {loading ? <p className="text-[#8899bb]">Loading…</p> : (
        <div className="flex flex-col gap-3">
          {articles.map((a) => (
            <div key={a.id} className="bg-[#111e33] border border-white/8 rounded-lg p-4 flex items-start justify-between gap-4">
              <div>
                <span className="inline-block bg-[#F4A623] text-[#0a1628] text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded mb-1">{a.tag}</span>
                <h3 className="font-condensed font-black text-white">{a.title}</h3>
                <p className="text-[#8899bb] text-xs mt-1">{formatDate(a.published_at)}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => startEdit(a)} className="text-[#F4A623] hover:underline text-xs font-condensed uppercase">Edit</button>
                <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-300 text-xs font-condensed uppercase">Delete</button>
              </div>
            </div>
          ))}
          {articles.length === 0 && <p className="text-[#8899bb]">No articles yet.</p>}
        </div>
      )}
    </div>
  )
}
