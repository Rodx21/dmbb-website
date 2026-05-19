import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — DMBB',
  description: 'Privacy policy for the Dublin Men\'s Basketball Board website.',
}

const sections = [
  {
    title: 'Who We Are',
    content: `The Dublin Men's Basketball Board (DMBB) is a voluntary sporting organisation that administers basketball competitions across Greater Dublin, Ireland. This website is operated on behalf of the DMBB. Our contact email is dmbbsecretary@eircom.net.`,
  },
  {
    title: 'What Data We Collect',
    content: `This website displays publicly available sporting data including fixture schedules, results, league standings, and club information. We do not collect personal data from visitors browsing this website.

If you contact us by email, we will retain your name and email address solely to respond to your enquiry. We do not add you to any mailing list without your explicit consent.

Club administrators who access the admin panel of this website provide an email address and password for authentication purposes. This data is stored securely via Supabase and is never shared with third parties.`,
  },
  {
    title: 'Player Data',
    content: `Player names and jersey numbers are displayed on this website as part of our sporting records. This information is collected and processed on the basis of legitimate sporting interest, consistent with Basketball Ireland registration requirements.

Players or their guardians who wish to request the removal of personal data from this website should contact the DMBB Secretary. We will respond within 30 days.`,
  },
  {
    title: 'Cookies',
    content: `This website uses only essential cookies required for authentication (admin login sessions). We do not use advertising cookies, tracking cookies, or third-party analytics.

If you are a regular visitor (not an admin), no cookies are set on your device.`,
  },
  {
    title: 'Third-Party Services',
    content: `This website is hosted on Vercel (vercel.com) and uses Supabase (supabase.com) for database and authentication services. Both providers operate under GDPR-compliant data processing agreements.

We do not share any data with advertising networks, social media platforms, or data brokers.`,
  },
  {
    title: 'Data Retention',
    content: `Sporting records (fixtures, results, standings) are retained indefinitely as part of the official DMBB historical record. Admin account credentials are retained for as long as the account is active. Email correspondence is retained for a maximum of 2 years.`,
  },
  {
    title: 'Your Rights (GDPR)',
    content: `Under the General Data Protection Regulation (GDPR) and the Data Protection Acts 1988–2018, you have the right to access personal data we hold about you, request correction of inaccurate data, request deletion of your data (right to erasure), object to processing of your data, and lodge a complaint with the Data Protection Commission (dataprotection.ie).

To exercise any of these rights, contact the DMBB Secretary at dmbbsecretary@eircom.net.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this privacy policy from time to time. The date of the most recent revision is shown below. Continued use of this website after changes are published constitutes acceptance of the updated policy.`,
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: '#0a1628' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a1628 60%, #111e33)' }}
        className="border-b border-white/8 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block mb-4 px-3 py-1 rounded text-xs font-black uppercase tracking-widest"
            style={{ background: '#F4A623', color: '#0a1628' }}>
            Legal
          </div>
          <h1 className="font-condensed font-black uppercase text-4xl md:text-5xl text-white mb-3">
            Privacy <span style={{ color: '#F4A623' }}>Policy</span>
          </h1>
          <p style={{ color: '#8899bb' }} className="text-sm">
            Last updated: September 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        {sections.map((section, i) => (
          <div key={section.title}
            className="rounded-lg border border-white/8 p-6"
            style={{ background: '#111e33' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-condensed font-black text-sm w-6 h-6 rounded flex items-center justify-center shrink-0"
                style={{ background: '#F4A623', color: '#0a1628' }}>
                {i + 1}
              </span>
              <h2 className="font-condensed font-black uppercase tracking-wide text-white">
                {section.title}
              </h2>
            </div>
            <div className="space-y-3">
              {section.content.split('\n\n').map((para, j) => (
                <p key={j} className="text-sm leading-relaxed" style={{ color: '#c8d4e8' }}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        ))}

        <p className="text-xs text-center pb-8" style={{ color: '#556' }}>
          © 2025/26 Dublin Men's Basketball Board. All rights reserved.
        </p>
      </div>
    </main>
      <Footer />
    </>
  )
}
