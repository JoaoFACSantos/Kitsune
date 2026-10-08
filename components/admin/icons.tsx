// Ícones do painel: traço simples, na cor do texto à volta.

const BASE = { viewBox: '0 0 24 24', 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 2.1, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export type NavIcon = 'home' | 'partners' | 'socials' | 'texts' | 'setup' | 'settings';

const NAV_PATHS: Record<NavIcon, string> = {
  home: 'M4 11.5 12 4l8 7.5M6.5 10v9.5h4v-5h3v5h4V10',
  partners: 'M12 20.5c-4.6-3-8-6-8-10A4.4 4.4 0 0 1 12 8a4.4 4.4 0 0 1 8 2.5c0 4-3.4 7-8 10Z',
  socials: 'M8.6 13.5l6.8 3.9M15.4 6.6 8.6 10.5M21 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM21 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  texts: 'M5 7V5h14v2M12 5v14M9 19h6',
  setup: 'M4 5.5h16v10.5H4zM9 20h6M12 16v4',
  settings: 'M5 7h9M18 7h1M5 17h1M10 17h9M16 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
};

export function NavGlyph({ icon }: { icon: NavIcon }) {
  return (
    <svg {...BASE}>
      <path d={NAV_PATHS[icon]} />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg {...BASE}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg {...BASE}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg {...BASE} strokeWidth={2.6}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Triângulo de aviso: acompanha sempre o texto, nunca vai sozinho. */
export function WarnIcon() {
  return (
    <svg {...BASE}>
      <path d="M12 4 2.8 19.5h18.4ZM12 10v4.5M12 17.2v.3" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg {...BASE}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.6v.3" />
    </svg>
  );
}

export function LogoutIcon() {
  return (
    <svg {...BASE}>
      <path d="M14 4.5h4.5v15H14M10 8l-4 4 4 4M6 12h9" />
    </svg>
  );
}
