import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Laddar in ett rent, modernt typsnitt
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SportHistoryClue | Match Data',
  description: 'Step into the arena and test your sports history knowledge.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased selection:bg-blue-600 selection:text-white`}>
        {/* Children är den specifika sidan (t.ex. din nya startsida) som laddas in */}
        {children}
      </body>
    </html>
  )
}