import FixtureCard from './FixtureCard'
import { formatDate } from '@/lib/utils'

type Fixture = {
  id: string
  home_team: { name: string }
  away_team: { name: string }
  scheduled_at: string
  venue?: string | null
  division?: { name: string }
  status: string
  result?: { home_score: number; away_score: number } | null
}

export default function FixturesList({ fixtures }: { fixtures: Fixture[] }) {
  const grouped: Record<string, Fixture[]> = {}
  for (const f of fixtures) {
    const key = formatDate(f.scheduled_at)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(f)
  }

  if (fixtures.length === 0) {
    return <p className="text-[#8899bb] text-sm py-6 text-center">No fixtures found.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grouped).map(([date, group]) => (
        <div key={date}>
          <h3 className="font-condensed font-black text-[#8899bb] text-xs uppercase tracking-widest mb-3">
            {date}
          </h3>
          <div className="flex flex-col gap-3">
            {group.map((f) => (
              <FixtureCard
                key={f.id}
                id={f.id}
                homeTeam={f.home_team.name}
                awayTeam={f.away_team.name}
                scheduledAt={f.scheduled_at}
                venue={f.venue}
                division={f.division?.name}
                status={f.status}
                homeScore={f.result?.home_score}
                awayScore={f.result?.away_score}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
