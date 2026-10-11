import type { Giveaway } from '@/content/types';
import { daysBetween } from '@/lib/day';

// As datas dos giveaways são dias do calendário ("2026-10-31"), pelo relógio de Lisboa: um
// giveaway vale até ao fim do seu último dia e sai do site no dia seguinte.
// Sem dependências do servidor: o painel (no browser) também usa isto.

export { formatDay, today } from '@/lib/day';

/** Ainda se pode participar: não tem data de fim, ou ela ainda não passou. */
export const isOpen = (giveaway: Giveaway, from: string) => !giveaway.endsAt || giveaway.endsAt >= from;

/** "termina hoje", "termina amanhã", "faltam 5 dias". */
export function countdown(endsAt: string, from: string) {
  const left = daysBetween(from, endsAt);
  if (left <= 0) return 'termina hoje';
  if (left === 1) return 'termina amanhã';
  return `faltam ${left} dias`;
}
