import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Contact — DMBB',
  description: 'Get in touch with the Dublin Men\'s Basketball Board.',
}

export default function ContactPage() {
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
            Get in touch
          </div>
          <h1 className="font-condensed font-black uppercase text-4xl md:text-5xl text-white mb-3">
            Contact <span style={{ color: '#F4A623' }}>Us</span>
          </h1>
          <p style={{ color: '#8899bb' }} className="text-sm max-w-xl">
            The DMBB is run entirely by volunteers. We aim to respond to all
            enquiries within 2–3 working days.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-6">

          {/* Contact cards */}
          {[
            {
              role: 'General Secretary',
              description: 'Registration, rules queries, general administration.',
              email: 'dmbbsecretary@eircom.net',
              icon: '📋',
            },
            {
              role: 'Results & Fixtures',
              description: 'Submit results, report postponements, fixture queries.',
              email: 'dmbbresults@eircom.net',
              icon: '📊',
            },
            {
              role: 'Referees Officer',
              description: 'Referee assignments, complaints, officiating matters.',
              email: 'dmbbref@eircom.net',
              icon: '🦺',
            },
            {
              role: 'Disciplinary Committee',
              description: 'Protests, appeals, player/club suspensions.',
              email: 'dmbbdiscipline@eircom.net',
              icon: '⚖️',
            },
          ].map((contact) => (
            <div key={contact.role}
              className="rounded-lg border border-white/8 p-6"
              style={{ background: '#111e33' }}>
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">{contact.icon}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-condensed font-black uppercase text-white tracking-wide mb-1">
                    {contact.role}
                  </h2>
                  <p className="text-xs mb-3" style={{ color: '#8899bb' }}>
                    {contact.description}
                  </p>
                  <a href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold transition-colors hover:underline"
                    style={{ color: '#F4A623' }}>
                    ✉ {contact.email}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AGM / Meetings */}
        <div className="mt-6 rounded-lg border border-white/8 p-6"
          style={{ background: '#111e33' }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">📅</span>
            <h2 className="font-condensed font-black uppercase text-white tracking-wide">
              Committee Meetings & AGM
            </h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#c8d4e8' }}>
            The DMBB Committee meets monthly during the season (October–May).
            The Annual General Meeting takes place in May each year and is open to all registered clubs.
            Notice of the AGM and agenda is circulated to all member clubs at least 14 days in advance.
          </p>
          <div className="mt-4 p-4 rounded border border-white/8" style={{ background: '#0a1628' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#F4A623' }}>
              Next AGM
            </p>
            <p className="text-sm text-white font-semibold">Tuesday 12th May 2026 — 7:30pm</p>
            <p className="text-xs mt-1" style={{ color: '#8899bb' }}>Venue to be confirmed. Contact the Secretary for details.</p>
          </div>
        </div>

        {/* New club */}
        <div className="mt-6 rounded-lg border border-white/8 p-6"
          style={{ background: '#111e33' }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">🏀</span>
            <h2 className="font-condensed font-black uppercase text-white tracking-wide">
              Registering a New Club
            </h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#c8d4e8' }}>
            Clubs wishing to join the DMBB for the first time should contact the General Secretary
            before the end of August each year. Registration requires a completed club application form,
            proof of Basketball Ireland affiliation, confirmation of home venue, and payment of the
            annual club registration fee.
          </p>
        </div>
      </div>
    </main>
      <Footer />
    </>
  )
}
