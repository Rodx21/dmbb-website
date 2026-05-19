'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-full bg-[#F4A623] flex items-center justify-center">
            <span className="font-condensed font-black text-[#0a1628]">DB</span>
          </div>
          <span className="font-condensed font-black text-white text-2xl uppercase">DMBB Admin</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#111e33] border border-white/8 rounded-lg p-8 flex flex-col gap-5"
        >
          <h1 className="font-condensed font-black text-xl uppercase text-white">Sign In</h1>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#8899bb] uppercase font-condensed font-black tracking-widest">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#0a1628] border border-white/8 text-white px-4 py-2.5 rounded text-sm focus:outline-none focus:border-[#F4A623]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#8899bb] uppercase font-condensed font-black tracking-widest">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#0a1628] border border-white/8 text-white px-4 py-2.5 rounded text-sm focus:outline-none focus:border-[#F4A623]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#F4A623] text-[#0a1628] font-black uppercase tracking-widest py-3 rounded hover:bg-[#ffbc45] transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
