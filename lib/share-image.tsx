import { ImageResponse } from 'next/og';
// Um Worker não tem disco de onde ler as fontes: vão dentro do código, em base64.
import caveat from '@/assets/og/Caveat-700.ttf?inline';
import jakarta from '@/assets/og/PlusJakartaSans-700.ttf?inline';
import unbounded from '@/assets/og/Unbounded-900.ttf?inline';
import { site } from '@/content/site.config';
import { localize } from '@/lib/content/localize';
import { getSite } from '@/lib/content/site';
import { getLiveStatus } from '@/lib/data';
import { formatInt } from '@/lib/format';
import type { Lang } from '@/lib/i18n';

// A imagem de partilha (Open Graph), nas duas línguas: mostra "EM DIRETO" quando a streamer está
// live. Quem a serve são app/opengraph-image.tsx (português) e app/en/opengraph-image.tsx (inglês).
export const SHARE_SIZE = { width: 1200, height: 630 };

const font = (dataUrl: string) => Uint8Array.from(Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64')).buffer;
const fonts = [unbounded, jakarta, caveat].map(font);

export async function shareImage(lang: Lang) {
  const [[display, sans, hand], live, config] = await Promise.all([fonts, getLiveStatus(), getSite()]);
  const { hero, role } = localize(config, lang);
  const { theme } = site;
  const status = !live.live
    ? 'OFFLINE'
    : lang === 'en'
      ? `LIVE · ${formatInt(live.viewers, lang)} WATCHING`
      : `EM DIRETO · ${formatInt(live.viewers, lang)} A VER`;

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
          <div style={{ fontFamily: 'Caveat', fontSize: 64, color: theme.pinkDeep, transform: 'rotate(-4deg)' }}>{hero.greeting}</div>
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
          <span>{role}</span>
          <span style={{ color: theme.pinkDeep }}>twitch.tv/{site.handle}</span>
        </div>
      </div>
    ),
    {
      ...SHARE_SIZE,
      fonts: [
        { name: 'Unbounded', data: display, weight: 900, style: 'normal' },
        { name: 'Jakarta', data: sans, weight: 700, style: 'normal' },
        { name: 'Caveat', data: hand, weight: 700, style: 'normal' },
      ],
    },
  );
}
