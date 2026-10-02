// Tokens de motion: todas as animações leem daqui.

export const EASE = {
  /** Entradas com "pop" (stickers, cartões). */
  pop: 'back.out(1.8)',
  /** Saltos elásticos (letras, foto). */
  bounce: 'elastic.out(1, 0.45)',
  /** Reveals suaves. */
  out: 'expo.out',
  soft: 'power3.out',
} as const;

export const DURATION = { fast: 0.4, base: 0.8, slow: 1.2 } as const;

export const STAGGER = { tight: 0.04, base: 0.07, loose: 0.12 } as const;

/**
 * Efeitos que seguem o cursor (tilt, botões magnéticos, brilhos). O cursor é nativo e não
 * tem atraso, por isso as reações são curtas; o ease "power3" mantém-nas suaves.
 */
export const FOLLOW = { fast: 0.3, base: 0.45, slow: 0.6, ease: 'power3' } as const;

export const MEDIA = {
  reduce: '(prefers-reduced-motion: reduce)',
  motion: '(prefers-reduced-motion: no-preference)',
  /** Rato ou trackpad: cursor próprio, tilt e hovers. */
  fine: '(hover: hover) and (pointer: fine)',
  desktop: '(min-width: 1024px)',
} as const;

export const LENIS_LERP = 0.13;

/** Chave do localStorage com o tema escolhido no switch ("dark" ou "light"). */
export const THEME_KEY = 'tema';
