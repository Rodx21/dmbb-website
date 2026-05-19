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

export default function StandingsTable({ standings }: { standings: Standing[] }) {
  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const pdA = a.points_for - a.points_against
    const pdB = b.points_for - b.points_against
    return pdB - pdA
  })

  return (
    <div className="overflow-x-auto rounded-lg border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#1a2d4a] text-[#8899bb] uppercase text-xs tracking-widest font-condensed">
            <th className="px-3 py-3 text-left w-8">#</th>
            <th className="px-3 py-3 text-left">Team</th>
            <th className="px-3 py-3 text-center">P</th>
            <th className="px-3 py-3 text-center">W</th>
            <th className="px-3 py-3 text-center">L</th>
            <th className="px-3 py-3 text-center hidden sm:table-cell">PF</th>
            <th className="px-3 py-3 text-center hidden sm:table-cell">PA</th>
            <th className="px-3 py-3 text-center hidden md:table-cell">PD</th>
            <th className="px-3 py-3 text-center hidden lg:table-cell">Form</th>
            <th className="px-3 py-3 text-center font-bold text-white">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, i) => {
            const isPromotion = i < 2
            const isRelegation = i >= sorted.length - 2 && sorted.length > 4
            const pd = s.points_for - s.points_against

            return (
              <tr
                key={s.team_id}
                className={`border-t border-white/8 transition-colors hover:bg-white/5 ${
                  isPromotion ? 'border-l-2 border-l-green-500' : ''
                } ${isRelegation ? 'border-l-2 border-l-red-500' : ''}`}
              >
                <td className="px-3 py-3 text-[#8899bb] text-center">{i + 1}</td>
                <td className="px-3 py-3 font-medium text-white">
                  <span className={isPromotion ? 'text-green-400' : isRelegation ? 'text-red-400' : ''}>
                    {s.team_name}
                  </span>
                </td>
                <td className="px-3 py-3 text-center text-[#8899bb]">{s.played}</td>
                <td className="px-3 py-3 text-center text-[#8899bb]">{s.won}</td>
                <td className="px-3 py-3 text-center text-[#8899bb]">{s.lost}</td>
                <td className="px-3 py-3 text-center text-[#8899bb] hidden sm:table-cell">{s.points_for}</td>
                <td className="px-3 py-3 text-center text-[#8899bb] hidden sm:table-cell">{s.points_against}</td>
                <td className="px-3 py-3 text-center text-[#8899bb] hidden md:table-cell">
                  {pd > 0 ? `+${pd}` : pd}
                </td>
                <td className="px-3 py-3 hidden lg:table-cell">
                  <div className="flex gap-1 justify-center">
                    {(s.form ?? []).map((r, fi) => (
                      <span
                        key={fi}
                        className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                          r === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3 text-center font-black text-white text-base">{s.points}</td>
              </tr>
            )
          })}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={10} className="px-3 py-8 text-center text-[#8899bb]">No standings data yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
