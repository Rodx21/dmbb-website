import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#111e33] border-t border-white/8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F4A623] flex items-center justify-center">
              <span className="font-condensed font-black text-[#0a1628] text-sm">DB</span>
            </div>
            <div>
              <p className="font-condensed font-black text-white text-lg uppercase">DMBB</p>
              <p className="text-[#8899bb] text-xs">Dublin Men&apos;s Basketball Board</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/fixtures" className="text-[#8899bb] hover:text-[#F4A623] transition-colors">Fixtures</Link>
            <Link href="/results" className="text-[#8899bb] hover:text-[#F4A623] transition-colors">Results</Link>
            <Link href="/standings" className="text-[#8899bb] hover:text-[#F4A623] transition-colors">Standings</Link>
            <Link href="/clubs" className="text-[#8899bb] hover:text-[#F4A623] transition-colors">Clubs</Link>
            <Link href="/news" className="text-[#8899bb] hover:text-[#F4A623] transition-colors">News</Link>
          </div>

          <div className="flex gap-5 text-sm">
            <Link href="/rules" className="text-[#8899bb] hover:text-white transition-colors">Rules</Link>
            <Link href="/contact" className="text-[#8899bb] hover:text-white transition-colors">Contact</Link>
            <Link href="/privacy" className="text-[#8899bb] hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/8 text-center text-[#8899bb] text-xs">
          &copy; {new Date().getFullYear()} Dublin Men&apos;s Basketball Board. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
