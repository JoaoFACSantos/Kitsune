import 'server-only';
import { shiftDay, today } from '@/lib/day';
import { db, ensureSchema, isMissingTable } from '@/lib/db';
import { isBot } from '@/lib/visits';

// Cliques nas parcerias, para o Início do painel: quantas vezes cada marca foi aberta, e por onde.
//
//   curto   pelo link curto (o-site/zumub), dito em direto ou posto numa descrição
//   site    pelo botão do cartão da parceria, no site
//   links   pela página de links (/links), a da bio das redes
//
// Fica só um total por dia, marca e origem: nada sobre quem clicou.

/** Dias que o painel soma. */
export const CLICK_DAYS = 30;

export const CLICK_SOURCES = ['curto', 'site', 'links'] as const;
export type ClickSource = (typeof CLICK_SOURCES)[number];
export type ClickCount = Record<ClickSource, number>;

export type ClickStats = {
  /** Quantos dias soma `recent`. */
  days: number;
  /** Os últimos `days` dias, por link curto da marca. */
  recent: Record<string, ClickCount>;
  /** Desde que a contagem começou, por link curto da marca. */
  total: Record<string, number>;
  /** O primeiro dia com cliques contados, ou null se ainda não há nenhum. */
  since: string | null;
};

const isSource = (value: unknown): value is ClickSource => CLICK_SOURCES.some((source) => source === value);

/**
 * Conta um clique. `headers` são os cabeçalhos do pedido. Devolve false se o pedido não é de uma
 * pessoa (um robô, um browser a adiantar-se).
 */
export async function recordClick(headers: Pick<Headers, 'get'>, slug: string, source: ClickSource): Promise<boolean> {
  if (isBot(headers.get('user-agent') ?? '')) return false;
  // Alguns browsers pedem a página antes de a pessoa clicar, para a terem pronta: não é um clique.
  if (/prefetch|prerender/i.test(headers.get('sec-purpose') ?? headers.get('purpose') ?? '')) return false;
  await ensureSchema();
  await db()
    .prepare('INSERT INTO clicks (day, slug, source, count) VALUES (?, ?, ?, 1) ON CONFLICT (day, slug, source) DO UPDATE SET count = count + 1')
    .bind(today(), slug, source)
    .run();
  return true;
}

/** Os números para o painel. Sem cliques contados (ou sem tabela ainda), vem tudo vazio. */
export async function getClicks(): Promise<ClickStats> {
  const stats: ClickStats = { days: CLICK_DAYS, recent: {}, total: {}, since: null };
  try {
    const [recent, all] = await db().batch<Record<string, unknown>>([
      db()
        .prepare('SELECT slug, source, sum(count) AS count FROM clicks WHERE day >= ? GROUP BY slug, source')
        .bind(shiftDay(today(), -(CLICK_DAYS - 1))),
      db().prepare('SELECT slug, sum(count) AS count, min(day) AS since FROM clicks GROUP BY slug'),
    ]);
    for (const row of recent.results) {
      if (!isSource(row.source)) continue;
      const slug = String(row.slug);
      stats.recent[slug] ??= { curto: 0, site: 0, links: 0 };
      stats.recent[slug][row.source] = Number(row.count) || 0;
    }
    for (const row of all.results) {
      stats.total[String(row.slug)] = Number(row.count) || 0;
      const since = String(row.since);
      if (!stats.since || since < stats.since) stats.since = since;
    }
  } catch (error) {
    if (!isMissingTable(error)) console.error('[cliques] não consegui ler', error);
  }
  return stats;
}
