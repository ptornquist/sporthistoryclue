import { ImageResponse } from 'next/og';
import { ogChallengeHeadline, ogChallengeSubtitle } from '@/lib/challenge-link';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const duel = searchParams.get('duel')?.trim() ?? '';
  const match = searchParams.get('match')?.trim() ?? '';
  const headline = ogChallengeHeadline(duel, match || null);
  const ptsParam = searchParams.get('pts')?.trim() || '0';
  const parsedPts = Number.parseInt(ptsParam, 10);
  const beatLine = ogChallengeSubtitle(Number.isFinite(parsedPts) ? parsedPts : 0);
  const rawCategory = searchParams.get('category')?.trim() ?? '';
  const category =
    rawCategory && rawCategory.toUpperCase() !== 'SPORTS DEDUCTION' ? rawCategory.toUpperCase() : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#09090b',
          color: '#fafafa',
          padding: 48,
          border: '16px solid #2563eb',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              padding: '10px 18px',
              borderRadius: 999,
            }}
          >
            DAGENS KLURING
          </div>
          {category ? (
            <div style={{ display: 'flex', color: '#93c5fd', fontSize: 22, letterSpacing: 3 }}>
              {category}
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: duel ? 60 : 72, fontWeight: 800, lineHeight: 1.1, maxWidth: 1040 }}>
            {headline}
          </div>
          {duel ? (
            <div style={{ display: 'flex', fontSize: 32, color: '#bfdbfe', maxWidth: 1040 }}>
              {beatLine}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '2px solid #27272a',
            paddingTop: 24,
            fontSize: 28,
            color: '#a1a1aa',
          }}
        >
          <div style={{ display: 'flex' }}>sportshistoryclue.com</div>
          <div style={{ display: 'flex' }}>6 ledtrådar. En historisk match.</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
