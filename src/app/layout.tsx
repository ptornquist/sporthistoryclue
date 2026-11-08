import type { Metadata, Viewport } from 'next';
import { InstallAppBanner } from '@/components/InstallAppBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'SportsHistoryClue | Dagens mysteriematch och sportdeduktion',
  description:
    '6 ledtrådar. 10 000 poäng. Kan du deducera ikoniska matcher från OS-finaler, VM och legendariska rivaliteter före ledtråd 6?',
  metadataBase: new URL('https://sportshistoryclue.com'),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SportsHistoryClue',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
  },
  openGraph: {
    title: 'SportsHistoryClue | Kan du slå min poäng?',
    description:
      '6 ledtrådar. 10 000 poäng på spel. Deducera ikoniska matcher ur idrottshistorien.',
    url: 'https://sportshistoryclue.com',
    siteName: 'SportsHistoryClue',
    images: [
      {
        url: '/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'SportsHistoryClue-arenan',
      },
    ],
    locale: 'sv_SE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SportsHistoryClue | Daglig sportdeduktion',
    description: '6 ledtrådar. 10 000 poäng. Testa din sportdeduktion.',
    creator: '@sportshistoryclue',
  },
};

export const viewport: Viewport = {
  themeColor: '#fafafa',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" className="overflow-x-hidden w-full max-w-full">
      <body className="antialiased bg-[#fafafa] text-zinc-900 selection:bg-blue-600 selection:text-white overflow-x-hidden w-full max-w-full">
        {children}
        <InstallAppBanner />
      </body>
    </html>
  );
}