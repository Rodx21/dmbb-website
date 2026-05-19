import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    { count: fixturesTotal },
    { count: fixturesScheduled },
    { count: resultsToday },
    { count: teamsTotal },
    { data: recentFixtures },
  ] = await Promise.all([
    supabase.from('fixtures').select('*', { count: 'exact', head: true }),
    supabase.from('fixtures').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
    supabase.from('fixtures').select('*', { count: 'exact', head: true })
      .eq('status', 'finished')
      .gte('scheduled_at', today.toISOString())
      .lt('scheduled_at', tomorrow.toISOString()),
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('fixtures')
      .select('id, scheduled_at, status, home_team:home_team_id(name), away_team:away_team_id(name), division:division_id(name)')
      .order('scheduled_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: 'Total Fixtures', value: fixturesTotal ?? 0, color: 'text-[#F4A623]' },
    { label: 'Upcoming', value: fixturesScheduled ?? 0, color: 'text-blue-400' },
    { label: "Results Today", value: resultsToday ?? 0, color: 'text-green-400' },
    { label: 'Teams', value: teamsTotal ?? 0, color: 'text-purple-400' },
  ]

  return (
    <div>
      <h1 className="font-condensed font-black text-3xl uppercase text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#111e33] border border-white/8 rounded-lg p-5">
            <p className="text-[#8899bb] text-xs uppercase font-condensed tracking-widest mb-2">{s.label}</p>
            <p className={`font-condensed font-black text-4xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-condensed font-black text-xl uppercase text-white mb-4">Recent Fixtures</h2>
        <div className="bg-[#111e33] border border-white/8 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a2d4a] text-[#8899bb] text-xs uppercase font-condensed tracking-widest">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Match</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Division</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recentFixtures ?? []).map((f: any) => (
                <tr key={f.id} className="border-t border-white/8 hover:bg-white/5">
                  <td className="px-4 py-3 text-[#8899bb] whitespace-nowrap">{formatDate(f.scheduled_at)}</td>
                  <td className="px-4 py-3 text-white">{f.home_team?.name} vs {f.away_team?.name}</td>
                  <td className="px-4 py-3 text-[#8899bb] hidden md:table-cell">{f.division?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
                      f.status === 'finished' ? 'bg-green-500/20 text-green-400' :
                      f.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!recentFixtures || recentFixtures.length === 0) && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-[#8899bb]">No fixtures yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
