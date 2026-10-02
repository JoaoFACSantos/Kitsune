// Formatação determinística: igual no servidor e no browser (sem erros de hidratação).

const NBSP = ' ';

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/** 1234 → "1 234". */
export function formatInt(value: number) {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

/** 184200 → "184 mil"; 1250000 → "1,3 M". */
export function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}${NBSP}M`;
  if (value >= 10_000) return `${Math.round(value / 1_000)}${NBSP}mil`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace('.', ',')}${NBSP}mil`;
  return String(value);
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

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Data ISO → "14 ago 2026" (em UTC, para dar o mesmo no servidor e no browser). */
export function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getUTCDate()}${NBSP}${MONTHS[date.getUTCMonth()]}${NBSP}${date.getUTCFullYear()}`;
}

/** Segundos → "0:28". */
export function formatDuration(seconds: number) {
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
