import type { Metadata, Viewport } from 'next';
import { InstallAppBanner } from '@/components/InstallAppBanner';
import { LocaleBoot } from '@/components/LocaleBoot';
import { LanguageProvider } from '@/lib/i18n/language-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'SportsHistoryClue | Dagens kluring',
  description:
    'Sex ledtrådar. 10 000 poäng. Kan du knäcka ikoniska matcher från OS, VM och klassiska rivaliteter före den sjätte ledtråden?',
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
      'Sex ledtrådar. 10 000 poäng. Knäck ikoniska matcher ur sportens historia.',
    url: 'https://sportshistoryclue.com',
    siteName: 'SportsHistoryClue',
    images: [
      {
        url: '/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'SportsHistoryClue',
      },
    ],
    locale: 'sv_SE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SportsHistoryClue | Dagens kluring',
    description: 'Sex ledtrådar. 10 000 poäng. Testa din sportkunskap.',
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
    <html lang="sv">
      <body className="antialiased bg-[#fafafa] text-zinc-900 selection:bg-blue-600 selection:text-white">
        <LanguageProvider>
          {children}
          <LocaleBoot />
          <InstallAppBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}