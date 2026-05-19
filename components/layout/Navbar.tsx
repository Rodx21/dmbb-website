'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/fixtures', label: 'Fixtures' },
  { href: '/results', label: 'Results' },
  { href: '/standings', label: 'Standings' },
  { href: '/stats', label: 'Stats' },
  { href: '/clubs', label: 'Clubs' },
  { href: '/news', label: 'News' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <nav ref={navRef} className="sticky top-0 z-50 bg-[#0a1628] border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#F4A623] flex items-center justify-center">
                <span className="font-condensed font-black text-[#0a1628] text-sm">DB</span>
              </div>
              <span className="font-condensed font-black text-white text-xl uppercase tracking-wide hidden sm:block">
                DMBB
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-stretch h-16">
              {NAV_LINKS.map((link) => {
                const active = pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-4 border-b-2 font-condensed font-black text-sm uppercase tracking-widest transition-colors ${
                      active
                        ? 'border-[#F4A623] text-[#F4A623]'
                        : 'border-transparent text-[#8899bb] hover:text-white hover:border-white/20'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              {/* Search icon (desktop) */}
              <button
                type="button"
                aria-label="Search"
                className="hidden md:flex p-2 rounded transition-colors text-[#8899bb] hover:text-white hover:bg-white/5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Hamburger */}
              <button
                onClick={() => setOpen((v) => !v)}
                className="md:hidden p-2 rounded text-[#8899bb] hover:text-white hover:bg-white/5 transition-colors"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {open ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-[#111e33] border-t border-white/8 shadow-xl">
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-3 py-3 rounded font-condensed font-black text-base uppercase tracking-widest transition-colors border-l-2 ${
                      active
                        ? 'text-[#F4A623] border-[#F4A623] bg-white/5'
                        : 'text-[#8899bb] border-transparent hover:text-white hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <div className="mt-2 pt-3 border-t border-white/8">
                <p className="px-3 text-[10px] uppercase tracking-widest font-black" style={{ color: '#33445a' }}>
                  Dublin Men&apos;s Basketball Board
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop — outside stacking context so it covers page content */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
