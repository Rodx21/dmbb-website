import { formatDate } from '@/lib/utils'

type ResultCardProps = {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  date: string
  venue?: string | null
  division?: string
}

export default function ResultCard({ homeTeam, awayTeam, homeScore, awayScore, date, venue, division }: ResultCardProps) {
  const homeWin = homeScore > awayScore

  return (
    <div className="bg-[#111e33] border border-white/8 rounded-lg p-4">
      {division && (
        <div className="mb-3">
          <span className="inline-block bg-[#F4A623] text-[#0a1628] text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
            {division}
          </span>
        </div>
      )}

      {/* 3-col grid: home | score-block | away */}
      <div className="grid grid-cols-[1fr_80px_1fr] items-center gap-2">

        {/* Home team */}
        <div className="text-right">
          <span className={`font-condensed font-black text-sm leading-tight block ${homeWin ? 'text-white' : 'text-[#8899bb]'}`}>
            {homeTeam}
          </span>
          {homeWin && (
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#F4A623' }}>
              Winner
            </span>
          )}
        </div>

        {/* Score block */}
        <div
          className="flex flex-col items-center justify-center py-2 px-1 rounded"
          style={{ background: '#0a1628' }}
        >
          <span
            className="font-condensed font-black text-xl tabular-nums leading-none"
            style={{ color: '#F4A623' }}
          >
            {homeScore}–{awayScore}
          </span>
          <span className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: '#33445a' }}>
            Final
          </span>
        </div>

        {/* Away team */}
        <div className="text-left">
          <span className={`font-condensed font-black text-sm leading-tight block ${!homeWin ? 'text-white' : 'text-[#8899bb]'}`}>
            {awayTeam}
          </span>
          {!homeWin && (
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#F4A623' }}>
              Winner
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-center mt-3" style={{ color: '#556677' }}>
        {formatDate(date)}{venue ? ` · ${venue}` : ''}
      </p>
    </div>
  )
}
