import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { db, ensureSchema, isMissingTable } from '@/lib/db';
import { shiftDay, today } from '@/lib/day';

// Contagem de visitas, para o Início do painel. Sem cookies e sem guardar quem é quem:
//
//   visits     um total por dia: visitas (cada vez que o site abre) e pessoas (cada uma conta uma vez)
//   visitors   as pessoas que já contaram hoje, para não contarem duas vezes
//
// Uma "pessoa" é uma impressão digital curta feita do dia, do endereço IP, do browser e de um
// segredo do site. O endereço não fica guardado, e da impressão não se chega a ele sem o segredo.
// As impressões de um dia apagam-se no dia seguinte: ficam só os totais.
// Quem volta noutro dia conta outra vez; a mesma pessoa com dois browsers conta duas.

/** Dias que o gráfico do painel mostra. */
export const VISIT_DAYS = 30;

export type VisitDay = { day: string; visitors: number; views: number };

export type VisitStats = {
  /** Os últimos VISIT_DAYS dias, do mais antigo para hoje (os dias sem visitas vêm a zero). */
  days: VisitDay[];
  /** Desde que a contagem começou. */
  total: { visitors: number; views: number };
  /** O primeiro dia com visitas contadas, ou null se ainda não há nenhuma. */
  since: string | null;
};

// Robôs e programas: os que correm JavaScript (os outros nem chegam a pedir a contagem das
// visitas) e os que abrem um link só para lhe tirar a pré-visualização (nos cliques).
const BOTS = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|uptime|scan|fetch|curl|wget|python|axios|node|facebookexternalhit|^whatsapp\//i;

/** O pedido não vem de uma pessoa: não conta como visita nem como clique. */
export const isBot = (agent: string) => !agent || BOTS.test(agent);

const SALT = "SELECT value FROM settings WHERE key = 'visit_salt'";
// O segredo não muda: lido uma vez, fica na memória da instância.
let salt: string | null = null;

async function visitSalt() {
  if (salt) return salt;
  await ensureSchema();
  await db().prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('visit_salt', ?)").bind(randomBytes(24).toString('base64url')).run();
  salt = (await db().prepare(SALT).first<{ value: string }>())?.value ?? null;
  if (!salt) throw new Error('Não consegui criar o segredo das visitas');
  return salt;
}

/** Conta uma visita. Devolve false se o pedido não é de uma pessoa (um robô, por exemplo). */
export async function recordVisit(request: Request): Promise<boolean> {
  const agent = request.headers.get('user-agent') ?? '';
  if (isBot(agent)) return false;
  const ip = (request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'local').trim();
  const day = today();
  const person = createHash('sha256')
    .update(`${day}\n${await visitSalt()}\n${ip}\n${agent}`)
    .digest('base64url')
    .slice(0, 22);

  // Só conta como pessoa nova se a impressão ainda não estava lá hoje.
  const added = await db().prepare('INSERT OR IGNORE INTO visitors (day, hash) VALUES (?, ?)').bind(day, person).run();
  const fresh = added.meta.changes > 0 ? 1 : 0;
  const row = await db()
    .prepare('INSERT INTO visits (day, views, visitors) VALUES (?1, 1, ?2) ON CONFLICT (day) DO UPDATE SET views = views + 1, visitors = visitors + ?2 RETURNING views')
    .bind(day, fresh)
    .first<{ views: number }>();
  // Primeira visita do dia: as impressões dos dias anteriores já não fazem falta.
  if (row?.views === 1) await db().prepare('DELETE FROM visitors WHERE day < ?').bind(day).run();
  return true;
}

/** Os números para o painel. Sem visitas contadas (ou sem tabela ainda), vem tudo a zero. */
export async function getVisits(): Promise<VisitStats> {
  const end = today();
  const start = shiftDay(end, -(VISIT_DAYS - 1));
  const byDay = new Map<string, VisitDay>();
  let total = { visitors: 0, views: 0 };
  let since: string | null = null;
  try {
    const [recent, all] = await db().batch<Record<string, unknown>>([
      db().prepare('SELECT day, visitors, views FROM visits WHERE day >= ? ORDER BY day').bind(start),
      db().prepare('SELECT min(day) AS since, sum(visitors) AS visitors, sum(views) AS views FROM visits'),
    ]);
    for (const row of recent.results) byDay.set(String(row.day), { day: String(row.day), visitors: Number(row.visitors) || 0, views: Number(row.views) || 0 });
    const sum = all.results[0];
    if (sum?.since) {
      since = String(sum.since);
      total = { visitors: Number(sum.visitors) || 0, views: Number(sum.views) || 0 };
    }
  } catch (error) {
    if (!isMissingTable(error)) console.error('[visitas] não consegui ler', error);
  }
  const days = Array.from({ length: VISIT_DAYS }, (_, i) => {
    const day = shiftDay(start, i);
    return byDay.get(day) ?? { day, visitors: 0, views: 0 };
  });
  return { days, total, since };
}
