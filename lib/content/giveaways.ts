import type { Giveaway } from '@/content/types';
import { daysBetween } from '@/lib/day';
import { type Lang, messages } from '@/lib/i18n';

// As datas dos giveaways são dias do calendário ("2026-10-31"), pelo relógio de Lisboa: um
// giveaway vale até ao fim do seu último dia e sai do site no dia seguinte.
// Sem dependências do servidor: o painel (no browser) também usa isto.

export { formatDay, today } from '@/lib/day';

/** Ainda se pode participar: não tem data de fim, ou ela ainda não passou. */
export const isOpen = (giveaway: Giveaway, from: string) => !giveaway.endsAt || giveaway.endsAt >= from;

/** "termina hoje", "termina amanhã", "faltam 5 dias" (ou em inglês). */
export function countdown(endsAt: string, from: string, lang: Lang = 'pt') {
  const left = daysBetween(from, endsAt);
  const m = messages(lang).giveaways;
  if (left <= 0) return m.endsToday;
  if (left === 1) return m.endsTomorrow;
  return m.daysLeft(left);
}
