// Formatação determinística: igual no servidor e no browser (sem erros de hidratação).
// Cada função tem a forma portuguesa e a inglesa ("76 mil" e "76K").

import type { Lang } from '@/lib/i18n';

const NBSP = ' ';

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/** 1234 → "1 234" (em inglês, "1,234"). */
export function formatInt(value: number, lang: Lang = 'pt') {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : NBSP);
}

/** 184200 → "184 mil"; 1250000 → "1,3 M" (em inglês, "184K" e "1.3M"). */
export function formatCompact(value: number, lang: Lang = 'pt') {
  if (lang === 'en') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 10_000) return `${Math.round(value / 1_000)}K`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return String(Math.round(value));
  }
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}${NBSP}M`;
  if (value >= 10_000) return `${Math.round(value / 1_000)}${NBSP}mil`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace('.', ',')}${NBSP}mil`;
  // Arredondado: os contadores animados passam por valores como 531.66287.
  return String(Math.round(value));
}

/** "o meu *setup*" → { before: "o meu ", em: "setup", after: "" }. */
export function splitEmphasis(text: string) {
  const match = text.match(/^([\s\S]*?)\*([\s\S]+?)\*([\s\S]*)$/);
  if (!match) return { before: text, em: '', after: '' };
  return { before: match[1], em: match[2], after: match[3] };
}

/** Remove os asteriscos de destaque. */
export function plain(text: string) {
  return text.replace(/\*/g, '');
}

const MONTHS: Record<Lang, string[]> = {
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** Data ISO → "14 ago 2026" (em inglês, "14 Aug 2026"; em UTC, para dar o mesmo no servidor e no browser). */
export function formatDate(iso: string, lang: Lang = 'pt') {
  const date = new Date(iso);
  return `${date.getUTCDate()}${NBSP}${MONTHS[lang][date.getUTCMonth()]}${NBSP}${date.getUTCFullYear()}`;
}

/** Segundos → "0:28". */
export function formatDuration(seconds: number) {
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
