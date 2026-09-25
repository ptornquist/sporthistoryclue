import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const duel = searchParams.get('duel')?.trim() ?? '';
  const ptsParam = searchParams.get('pts')?.trim() || '0';
  const parsedPts = Number.parseInt(ptsParam, 10);
  const ptsLabel = Number.isFinite(parsedPts) ? parsedPts.toLocaleString('en-US') : ptsParam;
  const category = searchParams.get('category')?.trim() || 'SPORTS DEDUCTION';

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
            SPORTS HISTORY CLUE · DAILY DROP
          </div>
          <div style={{ display: 'flex', color: '#93c5fd', fontSize: 22, letterSpacing: 3 }}>
            {category.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
            {duel ? `CHALLENGE FROM @${duel}` : 'Test Your Sports History IQ'}
          </div>
          {duel ? (
            <div style={{ display: 'flex', fontSize: 36, color: '#bfdbfe' }}>
              {`Can you beat their ${ptsLabel} PTS on today's mystery match?`}
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
          <div style={{ display: 'flex' }}>6 Clues. One Historic Match.</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
