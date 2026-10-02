import type { GearIcon, SocialId } from '@/content/types';

type IconProps = { className?: string };

/* ---------- Redes (glifos das plataformas) ---------- */

const SOCIAL_PATHS: Record<Exclude<SocialId, 'instagram' | 'kick'>, string> = {
  twitch:
    'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0 1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z',
  youtube:
    'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  tiktok:
    'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  discord:
    'M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.028C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.099.246.198.373.292a.077.077 0 0 1-.007.128 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.946 2.418-2.157 2.418Z',
};

export function SocialIcon({ id, className }: IconProps & { id: SocialId }) {
  if (id === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3" y="3" width="18" height="18" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (id === 'kick') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
        <path d="M3 3h6v5h2V6h2V3h8v6h-2v2h-2v2h2v2h2v6h-8v-3h-2v-2H9v5H3Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d={SOCIAL_PATHS[id]} />
    </svg>
  );
}

/* ---------- Equipamento do setup (duotone com contorno) ---------- */

const INK = 'var(--ink)';

export function GearGlyph({ icon, className }: IconProps & { icon: GearIcon }) {
  const common = { strokeWidth: 2.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none" style={{ stroke: INK }}>
      {icon === 'headset' ? (
        <>
          <path d="M15 20 18 8l8 7M49 20l-3-12-8 7" style={{ fill: 'var(--pink)' }} {...common} />
          <path d="M14 36v-6a18 18 0 0 1 36 0v6" {...common} />
          <rect x="9" y="32" width="12" height="18" rx="6" style={{ fill: 'var(--pink)' }} {...common} />
          <rect x="43" y="32" width="12" height="18" rx="6" style={{ fill: 'var(--pink)' }} {...common} />
          <path d="M15 50c1 6 7 8 13 7" {...common} />
        </>
      ) : null}
      {icon === 'mic' ? (
        <>
          <rect x="22" y="6" width="20" height="32" rx="10" style={{ fill: 'var(--lilac)' }} {...common} />
          <path d="M26 16h12M26 22h12M26 28h12" {...common} />
          <path d="M16 30a16 16 0 0 0 32 0M32 46v10M22 57h20" {...common} />
        </>
      ) : null}
      {icon === 'keyboard' ? (
        <>
          <rect x="5" y="17" width="54" height="30" rx="7" style={{ fill: 'var(--butter)' }} {...common} />
          <path d="M13 26h2M21 26h2M29 26h2M37 26h2M45 26h6M13 33h6M25 33h2M33 33h2M41 33h2M49 33h2M21 40h22" {...common} />
        </>
      ) : null}
      {icon === 'mouse' ? (
        <>
          <rect x="17" y="8" width="30" height="48" rx="15" style={{ fill: 'var(--mint)' }} {...common} />
          <path d="M32 8v16M17 24h30" {...common} />
          <rect x="29" y="14" width="6" height="7" rx="3" style={{ fill: 'var(--pink)' }} {...common} />
        </>
      ) : null}
      {icon === 'monitor' ? (
        <>
          <rect x="5" y="9" width="54" height="34" rx="6" style={{ fill: 'var(--lilac)' }} {...common} />
          <path d="M13 34l9-10 7 6 9-11 9 15" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M32 43v9M20 55h24" {...common} />
        </>
      ) : null}
      {icon === 'camera' ? (
        <>
          <path d="M8 22a5 5 0 0 1 5-5h7l4-6h16l4 6h7a5 5 0 0 1 5 5v24a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5Z" style={{ fill: 'var(--peach)' }} {...common} />
          <circle cx="32" cy="34" r="10" fill="#fff" {...common} />
          <circle cx="32" cy="34" r="4" style={{ fill: 'var(--pink)' }} />
          <circle cx="49" cy="24" r="1.8" style={{ fill: INK }} />
        </>
      ) : null}
      {icon === 'chair' ? (
        <>
          <path d="M20 8h24a4 4 0 0 1 4 4v24H16V12a4 4 0 0 1 4-4Z" style={{ fill: 'var(--pink)' }} {...common} />
          <path d="M26 16h12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
          <rect x="12" y="34" width="40" height="8" rx="4" style={{ fill: 'var(--lilac)' }} {...common} />
          <path d="M32 42v10M18 57l14-5 14 5" {...common} />
        </>
      ) : null}
      {icon === 'light' ? (
        <>
          <rect x="10" y="8" width="44" height="26" rx="6" style={{ fill: 'var(--butter)' }} {...common} />
          <path d="M18 16h28M18 22h28M18 28h28" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M32 34v20M22 56h20" {...common} />
        </>
      ) : null}
    </svg>
  );
}

/* ---------- Stickers do hero ---------- */

export type StickerKind = 'heart' | 'star' | 'gamepad' | 'paw' | 'gg' | 'fox';

const OUTLINE = { stroke: '#fff', strokeWidth: 9, strokeLinejoin: 'round' as const, paintOrder: 'stroke' as const };

export function StickerArt({ kind, className }: IconProps & { kind: StickerKind }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      {kind === 'heart' ? (
        <>
          <path d="M60 104C30 84 12 66 12 44c0-16 12-28 27-28 9 0 16 4 21 11 5-7 12-11 21-11 15 0 27 12 27 28 0 22-18 40-48 60Z" style={{ fill: 'var(--pink)' }} {...OUTLINE} />
          <path d="M34 34c-6 2-10 8-10 14" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".8" />
        </>
      ) : null}
      {kind === 'star' ? (
        <path d="M60 8c4 26 14 38 44 44-30 6-40 18-44 48-4-30-14-42-44-48 30-6 40-18 44-44Z" style={{ fill: 'var(--butter)' }} {...OUTLINE} />
      ) : null}
      {kind === 'gamepad' ? (
        <>
          <path d="M22 44c0-12 10-16 20-12h36c10-4 20 0 20 12l6 32c2 14-12 20-22 10l-8-8H46l-8 8c-10 10-24 4-22-10Z" style={{ fill: 'var(--violet)' }} {...OUTLINE} />
          <path d="M34 50h6v-6h6v6h6v6h-6v6h-6v-6h-6Z" fill="#fff" />
          <circle cx="78" cy="50" r="4.5" style={{ fill: 'var(--pink)' }} />
          <circle cx="88" cy="60" r="4.5" style={{ fill: 'var(--butter)' }} />
        </>
      ) : null}
      {kind === 'paw' ? (
        <>
          <path d="M60 60c14 0 28 12 28 26 0 12-10 16-20 14-4-1-6-3-8-3s-4 2-8 3c-10 2-20-2-20-14 0-14 14-26 28-26Z" style={{ fill: 'var(--lilac)' }} {...OUTLINE} />
          <ellipse cx="32" cy="50" rx="10" ry="13" style={{ fill: 'var(--lilac)' }} {...OUTLINE} />
          <ellipse cx="50" cy="30" rx="10" ry="13" style={{ fill: 'var(--lilac)' }} {...OUTLINE} />
          <ellipse cx="72" cy="30" rx="10" ry="13" style={{ fill: 'var(--lilac)' }} {...OUTLINE} />
          <ellipse cx="89" cy="50" rx="10" ry="13" style={{ fill: 'var(--lilac)' }} {...OUTLINE} />
          <path d="M60 72c8 0 14 6 14 12M40 46v4M58 28v4M82 46v4" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" fill="none" />
        </>
      ) : null}
      {kind === 'fox' ? (
        <>
          <path d="M26 60 20 14l40 22ZM94 60l6-46-40 22Z" fill="#FF9A52" {...OUTLINE} />
          <path d="M20 14l15 8-12 12ZM100 14l-15 8 12 12Z" style={{ fill: 'var(--dark)' }} />
          <path d="M60 30c22 0 38 14 40 36 8 6 12 14 12 20-8 0-12 2-16 6-8 10-22 16-36 16s-28-6-36-16c-4-4-8-6-16-6 0-6 4-14 12-20 2-22 18-36 40-36Z" fill="#FF9A52" {...OUTLINE} />
          <path d="M8 86c14-12 28-8 36-10 8-2 12-8 16-14 4 6 8 12 16 14 8 2 22-2 36 10-8 0-12 2-16 6-8 10-22 16-36 16s-28-6-36-16c-4-4-8-6-16-6Z" fill="#FFF3E4" />
          <circle cx="43" cy="64" r="5.5" style={{ fill: 'var(--dark)' }} />
          <path d="M70 65q7-7 14 0" fill="none" style={{ stroke: 'var(--dark)' }} strokeWidth="4" strokeLinecap="round" />
          <path d="M54 80q6-4 12 0-1 6-6 8-5-2-6-8Z" style={{ fill: 'var(--dark)' }} />
        </>
      ) : null}
      {kind === 'gg' ? (
        <>
          <path d="M16 22h88a10 10 0 0 1 10 10v40a10 10 0 0 1-10 10H54l-22 18 4-18H16A10 10 0 0 1 6 72V32a10 10 0 0 1 10-10Z" fill="#fff" style={{ stroke: 'var(--dark)' }} strokeWidth="4" strokeLinejoin="round" />
          <text x="60" y="66" textAnchor="middle" fontFamily="var(--font-hand)" fontWeight="700" fontSize="40" style={{ fill: 'var(--pink-deep)' }}>gg!</text>
        </>
      ) : null}
    </svg>
  );
}

/** Coração simples para as reações a flutuar. */
export function HeartShape({ className, style }: IconProps & { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 21C6 17 2 13.4 2 8.9 2 5.6 4.5 3 7.6 3c1.8 0 3.3.8 4.4 2.2C13.1 3.8 14.6 3 16.4 3 19.5 3 22 5.6 22 8.9c0 4.5-4 8.1-10 12.1Z" fill="currentColor" />
    </svg>
  );
}

/** Triângulo de "play". */
export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" fill="currentColor" />
    </svg>
  );
}

/** Brilho de 4 pontas (separadores, cursor). */
export function SparkleShape({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 1c.9 6 3.5 9.1 11 11-7.5 1.9-10.1 5-11 11-.9-6-3.5-9.1-11-11 7.5-1.9 10.1-5 11-11Z" fill="currentColor" />
    </svg>
  );
}

/** Sol e lua do switch de tema. */
export function SunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <circle cx="12" cy="12" r="4.6" />
      <path
        d="M12 1.8v2.6M12 19.6v2.6M4.8 4.8l1.8 1.8M17.4 17.4l1.8 1.8M1.8 12h2.6M19.6 12h2.6M4.8 19.2l1.8-1.8M17.4 6.6l1.8-1.8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z" />
    </svg>
  );
}
