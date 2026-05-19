import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DMBB – Dublin Men\'s Basketball Board',
  description: 'Official website of the Dublin Men\'s Basketball Board – fixtures, results, standings and news for basketball leagues across Greater Dublin.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
