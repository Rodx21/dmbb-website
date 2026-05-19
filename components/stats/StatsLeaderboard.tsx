'use client'

import { useState } from 'react'

type Leader = {
  playerId: string
  playerName: string
  teamName: string
  games: number
  totalPoints: number
  avgPoints?: number
}

type Division = {
  id: string
  name: string
  leaders: Leader[]
}

export default function StatsLeaderboard({ divisions }: { divisions: Division[] }) {
  const [active, setActive] = useState(divisions[0]?.id ?? '')
  const current = divisions.find(d => d.id === active)

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6">
        {divisions.map(d => (
          <button
            key={d.id}
            onClick={() => setActive(d.id)}
            className={`px-4 py-2 font-condensed font-black text-sm uppercase tracking-widest whitespace-nowrap rounded transition-colors ${
              active === d.id
                ? 'bg-[#F4A623] text-[#0a1628]'
                : 'bg-[#1a2d4a] text-[#8899bb] hover:text-white'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {current && (
        <div className="bg-[#111e33] border border-white/8 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 py-3 text-[#8899bb] font-condensed font-black uppercase text-xs tracking-widest w-10">#</th>
                <th className="text-left px-4 py-3 text-[#8899bb] font-condensed font-black uppercase text-xs tracking-widest">Player</th>
                <th className="text-left px-4 py-3 text-[#8899bb] font-condensed font-black uppercase text-xs tracking-widest hidden sm:table-cell">Team</th>
                <th className="text-center px-4 py-3 text-[#8899bb] font-condensed font-black uppercase text-xs tracking-widest w-16">GP</th>
                <th className="text-center px-4 py-3 text-[#8899bb] font-condensed font-black uppercase text-xs tracking-widest w-16">Total</th>
                <th className="text-center px-4 py-3 text-[#8899bb] font-condensed font-black uppercase text-xs tracking-widest w-16">Avg</th>
              </tr>
            </thead>
            <tbody>
              {current.leaders.map((l, i) => {
                const avg = l.avgPoints !== undefined ? l.avgPoints.toFixed(1) : l.games > 0 ? (l.totalPoints / l.games).toFixed(1) : '0.0'
                const isTop = i === 0
                return (
                  <tr
                    key={l.playerId}
                    className={`border-b border-white/5 ${isTop ? 'bg-[#F4A623]/5' : 'hover:bg-white/3'}`}
                  >
                    <td className="px-4 py-3">
                      {isTop
                        ? <span className="text-[#F4A623] font-condensed font-black">🏆</span>
                        : <span className="text-[#8899bb] font-condensed font-black">{i + 1}</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-condensed font-black ${isTop ? 'text-[#F4A623]' : 'text-white'}`}>
                        {l.playerName}
                      </span>
                      <span className="sm:hidden text-xs text-[#8899bb] block">{l.teamName}</span>
                    </td>
                    <td className="px-4 py-3 text-[#8899bb] hidden sm:table-cell">{l.teamName}</td>
                    <td className="px-4 py-3 text-center text-[#8899bb] font-condensed font-black">{l.games}</td>
                    <td className="px-4 py-3 text-center font-condensed font-black text-white">{l.totalPoints}</td>
                    <td className={`px-4 py-3 text-center font-condensed font-black ${isTop ? 'text-[#F4A623]' : 'text-white'}`}>
                      {avg}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
