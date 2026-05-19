import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin – DMBB',
}

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/results', label: 'Results' },
  { href: '/admin/fixtures', label: 'Fixtures' },
  { href: '/admin/players', label: 'Players' },
  { href: '/admin/teams', label: 'Teams' },
  { href: '/admin/news', label: 'News' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a1628]">
      <header className="bg-[#111e33] border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#F4A623] flex items-center justify-center">
            <span className="font-condensed font-black text-[#0a1628] text-xs">DB</span>
          </div>
          <span className="font-condensed font-black text-white uppercase text-sm tracking-widest">
            DMBB Admin
          </span>
        </div>
        <Link href="/" className="text-[#8899bb] hover:text-white text-sm">← Back to site</Link>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-48 bg-[#111e33] border-r border-white/8 shrink-0 hidden md:block">
          <nav className="p-4 flex flex-col gap-1 h-full min-h-full">
            {ADMIN_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded text-sm font-medium text-[#8899bb] hover:text-white hover:bg-white/5 transition-colors font-condensed uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-auto pt-4 border-t border-white/8">
              <form action="/api/admin/logout" method="POST">
                <button
                  type="submit"
                  className="w-full text-left px-3 py-2 rounded text-sm text-[#8899bb] hover:text-red-400 hover:bg-white/5 transition-colors font-condensed uppercase tracking-wide"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </nav>
        </aside>

        {/* Mobile top nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111e33] border-t border-white/8 z-50 flex">
          {ADMIN_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex-1 text-center py-3 text-xs text-[#8899bb] hover:text-white font-condensed uppercase"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
