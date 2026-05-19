'use client'

export type TickerResult = {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  division?: string
}

export default function ResultsTicker({ results }: { results: TickerResult[] }) {
  if (!results.length) return null

  const doubled = [...results, ...results]

  return (
    <div
      className="overflow-hidden flex items-center border-b border-white/8"
      style={{ background: '#060d18', height: '34px' }}
    >
      {/* Label pill */}
      <div
        className="shrink-0 h-full flex items-center px-4 text-[10px] font-black uppercase tracking-widest border-r border-white/8 z-10"
        style={{ background: '#F4A623', color: '#0a1628', minWidth: 'max-content' }}
      >
        Results
      </div>

      {/* Scrolling track */}
      <div className="overflow-hidden flex-1 relative">
        <div className="ticker-track">
          {doubled.map((r, i) => {
            const homeWin = r.homeScore > r.awayScore
            return (
              <span key={i} className="inline-flex items-center shrink-0 text-xs">
                <span
                  className="font-condensed font-black px-3 text-sm"
                  style={{ color: homeWin ? '#fff' : '#4a5a72' }}
                >
                  {r.homeTeam}
                </span>
                <span
                  className="font-condensed font-black tabular-nums px-2 text-base"
                  style={{ color: '#F4A623' }}
                >
                  {r.homeScore}–{r.awayScore}
                </span>
                <span
                  className="font-condensed font-black px-3 text-sm"
                  style={{ color: !homeWin ? '#fff' : '#4a5a72' }}
                >
                  {r.awayTeam}
                </span>
                {r.division && (
                  <span
                    className="text-[10px] uppercase tracking-wide pr-2"
                    style={{ color: '#2a3a52' }}
                  >
                    [{r.division}]
                  </span>
                )}
                <span style={{ color: '#1a2d4a', padding: '0 10px' }}>|</span>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
