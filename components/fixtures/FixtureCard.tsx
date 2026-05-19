'use client'

import { formatDate, formatTime, generateICS } from '@/lib/utils'

type FixtureCardProps = {
  id: string
  homeTeam: string
  awayTeam: string
  scheduledAt: string
  venue?: string | null
  division?: string
  status: string
  homeScore?: number | null
  awayScore?: number | null
  compact?: boolean
}

export default function FixtureCard({
  id, homeTeam, awayTeam, scheduledAt, venue, division, status, homeScore, awayScore, compact,
}: FixtureCardProps) {
  const hasResult = status === 'finished' && homeScore != null && awayScore != null

  function downloadICS() {
    const ics = generateICS({ id, homeTeam, awayTeam, scheduledAt, venue, division })
    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${homeTeam}-vs-${awayTeam}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-[#111e33] border border-white/8 rounded-lg p-4 flex flex-col gap-2">
      {division && (
        <span className="self-start bg-[#F4A623] text-[#0a1628] text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
          {division}
        </span>
      )}

      <div className="flex items-center justify-between gap-3">
        <span className="font-condensed font-black text-white text-sm flex-1 text-right">{homeTeam}</span>

        {hasResult ? (
          <span className="font-condensed font-black text-xl text-[#F4A623] min-w-[60px] text-center">
            {homeScore} – {awayScore}
          </span>
        ) : (
          <span className="font-condensed text-[#8899bb] text-sm min-w-[60px] text-center">
            {status === 'postponed' ? 'PPD' : formatTime(scheduledAt)}
          </span>
        )}

        <span className="font-condensed font-black text-white text-sm flex-1">{awayTeam}</span>
      </div>

      {!compact && (
        <div className="flex items-center justify-between text-xs text-[#8899bb] mt-1">
          <span>{formatDate(scheduledAt)}{venue ? ` · ${venue}` : ''}</span>
          {!hasResult && status === 'scheduled' && (
            <button
              onClick={downloadICS}
              className="text-[#F4A623] hover:underline text-xs"
            >
              + Calendar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
