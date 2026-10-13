import 'server-only';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { db, ensureSchema, isMissingTable } from '@/lib/db';

// Entrada no painel (/admin): uma password só, definida em ADMIN_PASSWORD nos segredos do
// Worker. Quem acerta fica com um cookie assinado que dura duas semanas. Não há tabela de
// sessões: mudar a password invalida todos os cookies antigos, e "Sair" também (troca o segredo
// com que são assinados), em todos os aparelhos de uma vez.

const COOKIE = 'painel';
const MAX_AGE_S = 14 * 24 * 60 * 60;
/** Uma password curta num endereço público adivinha-se: abaixo disto o painel não liga. */
export const MIN_PASSWORD = 12;

// Tentativas falhadas, na base de dados (um Worker corre em muitas instâncias ao mesmo tempo, a
// memória de uma não serve). Por endereço IP e também no total: passado esse total a porta fecha
// para toda a gente até a janela acabar. O total também limita o que um ataque consegue escrever.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const MAX_FAILURES_TOTAL = 60;
const TOTAL = '*';

function password(): string | null {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value && value.length >= MIN_PASSWORD ? value : null;
}

/** 'ready': o painel está ligado. 'missing' ou 'weak': falta a password, ou é curta de mais. */
export function adminStatus(): 'ready' | 'missing' | 'weak' {
  if (password()) return 'ready';
  return process.env.ADMIN_PASSWORD?.trim() ? 'weak' : 'missing';
}

const digest = (value: string) => createHash('sha256').update(value).digest();

const SECRET = "SELECT value FROM settings WHERE key = 'session_secret'";

/** O segredo das sessões: aleatório, criado na primeira entrada e guardado na base de dados. */
async function sessionSecret(create: boolean): Promise<string | null> {
  try {
    const row = await db().prepare(SECRET).first<{ value: string }>();
    if (row) return row.value;
  } catch (error) {
    if (!isMissingTable(error)) throw error;
  }
  if (!create) return null;
  await ensureSchema();
  // Duas entradas ao mesmo tempo: fica o segredo da primeira, e as duas leem esse.
  await db().prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('session_secret', ?)").bind(randomBytes(32).toString('base64url')).run();
  return (await db().prepare(SECRET).first<{ value: string }>())?.value ?? null;
}

// A chave das assinaturas sai do segredo das sessões e da password (sem mais segredos para
// configurar). Quem apanhasse um cookie não conseguia testar passwords contra ele: falta-lhe o
// segredo. E não se usa uma função lenta, que não cabia no tempo de processador de um Worker.
// A chave fica guardada enquanto a password e o segredo forem os mesmos. O segredo lê-se da base
// de dados a cada pedido do painel: "Sair" troca-o, e as outras instâncias do Worker têm de dar
// por isso logo, não quando calhar reiniciarem.
let signingKey: { password: string; secret: string; key: Buffer } | null = null;

/** A assinatura, ou null se ainda não houver segredo (ninguém entrou até agora). */
async function sign(payload: string, password: string, create = false) {
  const secret = await sessionSecret(create);
  if (!secret) return null;
  if (signingKey?.password !== password || signingKey.secret !== secret) {
    signingKey = { password, secret, key: createHmac('sha256', secret).update(password).digest() };
  }
  return createHmac('sha256', signingKey.key).update(payload).digest('base64url');
}

/** Compara em tempo constante, para o tempo de resposta não dar pistas. */
function same(a: string, b: string) {
  return timingSafeEqual(digest(a), digest(b));
}

export function checkPassword(attempt: string) {
  const secret = password();
  return secret !== null && same(attempt, secret);
}

/** Em produção é sempre HTTPS (o proxy.ts manda para lá quem vem por HTTP); só no próprio computador é que não. */
async function isHttps() {
  const h = await headers();
  const proto = h.get('x-forwarded-proto')?.split(',')[0]?.trim();
  if (proto) return proto === 'https';
  return !/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(h.get('host') ?? '');
}

export async function createSession() {
  const secret = password();
  if (!secret) return;
  const expires = String(Date.now() + MAX_AGE_S * 1000);
  const signature = await sign(expires, secret, true);
  if (!signature) throw new Error('Não consegui criar o segredo das sessões');
  (await cookies()).set(COOKIE, `${expires}.${signature}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: await isHttps(),
    // Só vai nos pedidos do painel (a página, as ações e o envio de imagens).
    path: '/admin',
    maxAge: MAX_AGE_S,
  });
}

export async function destroySession() {
  (await cookies()).set(COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: await isHttps(), path: '/admin', maxAge: 0 });
}

/**
 * Troca o segredo das sessões: todos os cookies passados deixam de valer, em todos os aparelhos.
 * Apagar o cookie só o tira deste browser; uma cópia dele (roubada, por exemplo) continuava boa.
 */
export async function endAllSessions() {
  try {
    await db().prepare("UPDATE settings SET value = ? WHERE key = 'session_secret'").bind(randomBytes(32).toString('base64url')).run();
  } catch (error) {
    if (!isMissingTable(error)) throw error;
  }
}

/** Tem um cookie válido? Tudo o que mexe no conteúdo começa por perguntar isto. */
export async function isAdmin(): Promise<boolean> {
  const secret = password();
  if (!secret) return false;
  const [expires, signature] = ((await cookies()).get(COOKIE)?.value ?? '').split('.');
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  const expected = await sign(expires, secret);
  return expected !== null && same(signature, expected);
}

/** O endereço de quem faz o pedido, para contar tentativas. */
export async function clientIp() {
  const h = await headers();
  return (h.get('cf-connecting-ip') ?? h.get('x-forwarded-for')?.split(',')[0] ?? h.get('x-real-ip') ?? 'local').trim();
}

export async function tooManyFailures(ip: string) {
  try {
    const { results } = await db()
      .prepare('SELECT key, count FROM login_failures WHERE key IN (?1, ?2) AND until > ?3')
      .bind(ip, TOTAL, Date.now())
      .all<{ key: string; count: number }>();
    return results.some(({ key, count }) => count >= (key === TOTAL ? MAX_FAILURES_TOTAL : MAX_FAILURES));
  } catch (error) {
    if (isMissingTable(error)) return false;
    throw error;
  }
}

export async function recordFailure(ip: string) {
  await ensureSchema();
  const now = Date.now();
  const count = db().prepare('INSERT INTO login_failures (key, count, until) VALUES (?, 1, ?) ON CONFLICT (key) DO UPDATE SET count = count + 1');
  await db().batch([
    // As janelas que já acabaram saem primeiro: a tabela não cresce sem fim e a contagem recomeça.
    db().prepare('DELETE FROM login_failures WHERE until < ?').bind(now),
    count.bind(ip, now + WINDOW_MS),
    count.bind(TOTAL, now + WINDOW_MS),
  ]);
}

/** Entrou: as falhas desse endereço deixam de contar (as do total só saem com o tempo). */
export async function clearFailures(ip: string) {
  try {
    await db().prepare('DELETE FROM login_failures WHERE key = ?').bind(ip).run();
  } catch (error) {
    if (!isMissingTable(error)) throw error;
  }
}

/** O pedido vem do próprio site? (Para os envios de imagens, que não são ações do Next.) */
export async function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const h = await headers();
  const host = h.get('x-forwarded-host')?.split(',')[0]?.trim() ?? h.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
