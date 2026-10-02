import type { Theme } from '@/content/types';

// Cursor nativo em forma de coração, gerado com as cores do tema.
// Sendo o cursor do sistema, segue o rato sem atraso nenhum (sem JS a cada movimento).
// O ponto de clique é o centro do coração.

const HEART =
  'M16 28C9 23.5 4 19.3 4 13.8 4 10.3 6.7 7.6 10 7.6c2.4 0 4.6 1.3 6 3.3 1.4-2 3.6-3.3 6-3.3 3.3 0 6 2.7 6 6.2 0 5.5-5 9.7-12 14.2Z';
const TILT = 'rotate(-12 16 16) translate(16 17) scale(0.92) translate(-16 -17)';
const SPARKLE = 'M26 2.5c.5 2.8 1.6 3.9 4.4 4.4-2.8.5-3.9 1.6-4.4 4.4-.5-2.8-1.6-3.9-4.4-4.4 2.8-.5 3.9-1.6 4.4-4.4Z';

function heart(fill: string, outline: string, sparkle = false) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">',
    `<g transform="${TILT}">`,
    `<path d="${HEART}" fill="none" stroke="${outline}" stroke-width="3.4" stroke-linejoin="round"/>`,
    `<path d="${HEART}" fill="${fill}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>`,
    '<path d="M9.5 12.2c.4-1.6 1.6-2.6 3-2.8" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>',
    '</g>',
    sparkle ? `<path d="${SPARKLE}" fill="#fff" stroke="${outline}" stroke-width="1.2" stroke-linejoin="round"/>` : '',
    '</svg>',
  ].join('');
}

const url = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/** Variáveis CSS com os cursores (normal, hover e a arrastar), para o <html>. */
export function cursorVars(theme: Theme) {
  return {
    '--cursor': `${url(heart(theme.pink, theme.ink))} 16 16, auto`,
    '--cursor-hover': `${url(heart(theme.pinkDeep, theme.ink, true))} 16 16, pointer`,
    '--cursor-grabbing': `${url(heart(theme.lilac, theme.ink, true))} 16 16, grabbing`,
  };
}
