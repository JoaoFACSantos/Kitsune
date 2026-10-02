import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { site } from '@/content/site.config';
import { getLiveStatus } from '@/lib/data';
import { formatInt } from '@/lib/format';

// Imagem Open Graph dinâmica: mostra "EM DIRETO" quando a streamer está live.
export const alt = `${site.name} · ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 60;

const fonts = Promise.all([
  readFile(join(process.cwd(), 'assets/og/Unbounded-900.ttf')),
  readFile(join(process.cwd(), 'assets/og/PlusJakartaSans-700.ttf')),
  readFile(join(process.cwd(), 'assets/og/Caveat-700.ttf')),
]);

export default async function Image() {
  const [[display, sans, hand], live] = await Promise.all([fonts, getLiveStatus()]);
  const { theme } = site;
  const status = live.live ? `EM DIRETO · ${formatInt(live.viewers)} A VER` : 'OFFLINE';

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '64px 72px',
          background: `linear-gradient(135deg, ${theme.bg} 0%, #FFE1EF 55%, #EFE6FF 100%)`,
          color: theme.ink,
          fontFamily: 'Jakarta',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -140,
            width: 560,
            height: 560,
            borderRadius: 280,
            background: theme.pink,
            opacity: 0.25,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 24px',
              borderRadius: 999,
              background: live.live ? theme.pinkDeep : '#FFFFFF',
              color: live.live ? '#FFFFFF' : theme.ink,
              fontSize: 26,
              letterSpacing: 2,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 7, background: live.live ? '#FFFFFF' : '#B9A9BA' }} />
            {status}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'Caveat', fontSize: 64, color: theme.pinkDeep, transform: 'rotate(-4deg)' }}>{site.hero.greeting}</div>
          <div
            style={{
              fontFamily: 'Unbounded',
              fontSize: 190,
              lineHeight: 1,
              letterSpacing: -6,
              color: theme.pink,
              textShadow: `0 8px 0 ${theme.pinkDeep}`,
            }}
          >
            {site.name.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 30 }}>
          <span>{site.role}</span>
          <span style={{ color: theme.pinkDeep }}>twitch.tv/{site.handle}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Unbounded', data: display, weight: 900, style: 'normal' },
        { name: 'Jakarta', data: sans, weight: 700, style: 'normal' },
        { name: 'Caveat', data: hand, weight: 700, style: 'normal' },
      ],
    },
  );
}
