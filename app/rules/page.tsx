import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'League Rules — DMBB',
  description: 'Official rules and regulations for DMBB Dublin Men\'s Basketball competitions 2025/26.',
}

const sections = [
  {
    title: 'Eligibility',
    icon: '👤',
    rules: [
      'All players must be registered with Basketball Ireland and hold a valid BIPIN number before playing any competitive fixture.',
      'Players must be 16 years of age or over to participate in Senior (Div 1–4) competitions.',
      'A player may only represent one club per division per season. Transfers between clubs require a completed Transfer Form submitted to the DMBB Secretary.',
      'Guest players are not permitted in any DMBB league or cup competition.',
    ],
  },
  {
    title: 'Fixtures & Scheduling',
    icon: '📅',
    rules: [
      'All fixtures must be played on the date and time assigned by the DMBB. Postponements require written agreement from both clubs and DMBB approval at least 48 hours in advance.',
      'The home team is responsible for securing and confirming the venue. Venue changes must be notified to the away team and DMBB no later than 48 hours before tip-off.',
      'Tip-off times are strictly enforced. A team unable to field 5 players within 15 minutes of the scheduled tip-off time shall forfeit the game (20–0).',
      'All results must be submitted to the DMBB Secretary by email within 24 hours of the final buzzer.',
    ],
  },
  {
    title: 'Team & Roster Rules',
    icon: '🏀',
    rules: [
      'A minimum of 5 registered players is required to start a game. A team may continue with fewer than 5 players due to fouls or injury but must begin with 5.',
      'Squad numbers must be registered at the start of the season. Players must wear their registered number throughout the season.',
      'Team jerseys must be a uniform colour. Clashing colours require the away team to change. A set of bibs may be used in emergencies but repeated failure to provide proper jerseys may result in a fine.',
      'Each team is allowed two time-outs per half. One additional time-out is permitted in each overtime period.',
    ],
  },
  {
    title: 'Scoring & Points System',
    icon: '📊',
    rules: [
      'League points: 2 points awarded for a win, 1 point awarded for a loss (no zero-point results unless a walkover is declared).',
      'A walkover result is recorded as 20–0 in favour of the non-offending team. The offending team receives 0 points.',
      'In the event of a points tie in the league table, the following tie-breakers apply in order: (1) head-to-head record, (2) point differential in head-to-head games, (3) overall point differential, (4) points scored.',
      'Cup competitions use single-elimination knockout format. All drawn games proceed to 5-minute overtime periods until a winner is determined.',
    ],
  },
  {
    title: 'Discipline & Conduct',
    icon: '⚖️',
    rules: [
      'Players accumulating 5 personal fouls are disqualified from that game. Technical and flagrant fouls count toward personal foul totals.',
      'Any player receiving a technical foul for unsportsmanlike conduct (arguing calls, abusive language, taunting) is subject to additional DMBB disciplinary review.',
      'Fights or physical altercations result in automatic ejection and mandatory DMBB Disciplinary Committee review. Suspensions of 2–10 games may be imposed.',
      'Club officials, coaches, and spectators are the responsibility of their respective clubs. Clubs may be sanctioned for the behaviour of their supporters.',
    ],
  },
  {
    title: 'Officials & Referees',
    icon: '🦺',
    rules: [
      'All games must be officiated by FIBA-licensed referees appointed through Basketball Ireland. Clubs may not arrange their own officials.',
      'Referee fees are the responsibility of the home team and must be paid on the night of the game.',
      'Referee decisions are final during play. Protests relating to rule misapplication (not judgment calls) must be submitted in writing to the DMBB Secretary within 48 hours.',
      'Score sheets must be signed by both team captains and the lead referee at the end of every game.',
    ],
  },
  {
    title: 'Cup Competitions',
    icon: '🏆',
    rules: [
      'Cup draws are conducted by the DMBB Committee. Seedings may be applied based on previous season league positions.',
      'All cup games are single-leg knockout ties. Home advantage is determined by the draw.',
      'Cup Finals are held at a neutral venue designated by the DMBB Committee, typically Oblate Hall, Inchicore.',
      'Any team withdrawing from a cup competition without valid reason will be liable for a fine and may face exclusion from the following season\'s competition.',
    ],
  },
  {
    title: 'Protests & Appeals',
    icon: '📋',
    rules: [
      'Protests must be submitted in writing to the DMBB Secretary within 48 hours of the relevant game.',
      'A protest fee of €50 is required with each submission. This fee is refunded if the protest is upheld.',
      'The DMBB Disciplinary Committee will hear all protests and issue rulings within 7 days.',
      'Appeals against Disciplinary Committee decisions may be made to Basketball Ireland in accordance with their national appeals procedure.',
    ],
  },
]

export default function RulesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: '#0a1628' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a1628 60%, #111e33)' }}
        className="border-b border-white/8 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-3 py-1 rounded text-xs font-black uppercase tracking-widest"
            style={{ background: '#F4A623', color: '#0a1628' }}>
            2025/26 Season
          </div>
          <h1 className="font-condensed font-black uppercase text-4xl md:text-5xl text-white mb-3">
            League <span style={{ color: '#F4A623' }}>Rules</span>
          </h1>
          <p style={{ color: '#8899bb' }} className="text-sm max-w-xl">
            Official rules and regulations governing all DMBB competitions.
            Clubs and players are expected to be familiar with these rules before participating.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {sections.map((section) => (
          <div key={section.title}
            className="rounded-lg border border-white/8 overflow-hidden"
            style={{ background: '#111e33' }}>
            {/* Section header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
              <span className="text-xl">{section.icon}</span>
              <h2 className="font-condensed font-black uppercase tracking-wide text-white text-lg">
                {section.title}
              </h2>
            </div>
            {/* Rules list */}
            <ul className="divide-y divide-white/5">
              {section.rules.map((rule, i) => (
                <li key={i} className="flex gap-4 px-5 py-4">
                  <span className="font-condensed font-black text-xs mt-0.5 shrink-0 w-5 text-center"
                    style={{ color: '#F4A623' }}>
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: '#c8d4e8' }}>
                    {rule}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Footer note */}
        <p className="text-xs text-center pb-8" style={{ color: '#556' }}>
          These rules are supplementary to the Basketball Ireland National Rules.
          In cases of conflict, Basketball Ireland rules take precedence.
          Last updated: September 2025.
        </p>
      </div>
    </main>
      <Footer />
    </>
  )
}
