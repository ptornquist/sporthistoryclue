import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SportsHistoryClue | Daily Mystery Match & Sports Deduction',
  description:
    '6 progressive clues. 10,000 points. Can you deduce iconic sporting fixtures from Olympic finals, World Cups, and legendary rivalries before Clue 6?',
  metadataBase: new URL('https://sportshistoryclue.com'),
  openGraph: {
    title: 'SportsHistoryClue | Can You Beat My Deduction Score?',
    description:
      '6 progressive clues. 10,000 points on the line. Deduce iconic fixtures across sports history in 60 seconds.',
    url: 'https://sportshistoryclue.com',
    siteName: 'SportsHistoryClue',
    images: [
      {
        url: '/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'SportsHistoryClue Arena',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SportsHistoryClue | Daily Sports Deduction',
    description: '6 clues. 10,000 points. Test your sports deduction IQ.',
    creator: '@sportshistoryclue',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#fafafa] text-zinc-900 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}