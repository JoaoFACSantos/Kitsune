import type { Giveaway } from '@/content/types';

// As datas dos giveaways são dias do calendário ("2026-10-31"), pelo relógio de Lisboa: um
// giveaway vale até ao fim do seu último dia e sai do site no dia seguinte.
// Sem dependências do servidor: o painel (no browser) também usa isto.

const LISBON = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' });
const LONG = new Intl.DateTimeFormat('pt-PT', { timeZone: 'UTC', day: 'numeric', month: 'long' });

/** O dia de hoje em Lisboa, "AAAA-MM-DD". */
export const today = () => LISBON.format(new Date());

/** Dias que faltam até ao último dia (0: acaba hoje; negativo: já acabou). */
export const daysLeft = (endsAt: string, from: string) => Math.round((Date.parse(`${endsAt}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/** Ainda se pode participar: não tem data de fim, ou ela ainda não passou. */
export const isOpen = (giveaway: Giveaway, from: string) => !giveaway.endsAt || giveaway.endsAt >= from;

/** "31 de outubro". */
export const formatDay = (day: string) => LONG.format(new Date(`${day}T00:00:00Z`));

/** "termina hoje", "termina amanhã", "faltam 5 dias". */
export function countdown(endsAt: string, from: string) {
  const left = daysLeft(endsAt, from);
  if (left <= 0) return 'termina hoje';
  if (left === 1) return 'termina amanhã';
  return `faltam ${left} dias`;
}
