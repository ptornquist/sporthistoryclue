import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SHC | Sports History',
  description: 'Master the history. Climb the leaderboards.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-zinc-900 antialiased selection:bg-blue-600 selection:text-white`}>
        {children}
      </body>
    </html>
  )
}