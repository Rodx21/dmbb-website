'use client'

import { useState } from 'react'
import StandingsTable from './StandingsTable'

type Standing = {
  team_id: string
  team_name: string
  played: number
  won: number
  lost: number
  points_for: number
  points_against: number
  points: number
  form?: ('W' | 'L')[]
}

type Division = {
  id: string
  name: string
  standings: Standing[]
}

export default function DivisionTabs({ divisions }: { divisions: Division[] }) {
  const [active, setActive] = useState(divisions[0]?.id ?? '')
  const current = divisions.find((d) => d.id === active)

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
        {divisions.map((d) => (
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
      {current && <StandingsTable standings={current.standings} />}
    </div>
  )
}
