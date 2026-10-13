// Dias do calendário ("2026-10-31"), pelo relógio de Lisboa: é assim que o site conta os prazos
// dos giveaways e as visitas de cada dia.
// Sem dependências do servidor: o painel (no browser) também usa isto.

const LISBON = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' });
const LONG = new Intl.DateTimeFormat('pt-PT', { timeZone: 'UTC', day: 'numeric', month: 'long' });
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const WEEKDAY = new Intl.DateTimeFormat('pt-PT', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' });

const DAY_MS = 86_400_000;
const at = (day: string) => new Date(`${day}T00:00:00Z`);

const TIME = new Intl.DateTimeFormat('pt-PT', { timeZone: 'Europe/Lisbon', hour: '2-digit', minute: '2-digit' });

/** O dia em que um instante calha em Lisboa, "AAAA-MM-DD". */
export const dayOf = (date: Date) => LISBON.format(date);

/** A hora de um instante em Lisboa, "17:10". */
export const formatTime = (date: Date) => TIME.format(date);

/** O dia de hoje em Lisboa, "AAAA-MM-DD". */
export const today = () => LISBON.format(new Date());

/** O dia que fica `by` dias depois (ou antes, com um número negativo). */
export const shiftDay = (day: string, by: number) => new Date(at(day).getTime() + by * DAY_MS).toISOString().slice(0, 10);

/** Dias de `from` até `to` (negativo se `to` já passou). */
export const daysBetween = (from: string, to: string) => Math.round((at(to).getTime() - at(from).getTime()) / DAY_MS);

/** "31 de outubro". */
export const formatDay = (day: string) => LONG.format(at(day));

/** "31 out". */
export const formatDayShort = (day: string) => `${at(day).getUTCDate()} ${MONTHS[at(day).getUTCMonth()]}`;

/** "sábado, 31 de outubro". */
export const formatWeekday = (day: string) => WEEKDAY.format(at(day));
