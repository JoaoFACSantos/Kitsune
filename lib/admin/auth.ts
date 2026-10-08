import 'server-only';
import { createHash, createHmac, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';

// Entrada no painel (/admin): uma password só, definida em ADMIN_PASSWORD no ambiente do
// servidor. Quem acerta fica com um cookie assinado que dura duas semanas. Não há base de
// dados de sessões: mudar a password invalida todos os cookies antigos.

const COOKIE = 'painel';
const MAX_AGE_S = 14 * 24 * 60 * 60;
/** Uma password curta num endereço público adivinha-se: abaixo disto o painel não liga. */
export const MIN_PASSWORD = 12;

// Tentativas falhadas, em memória (chega para um servidor só). Por endereço IP e, como o endereço
// se consegue falsificar quando não há um proxy de confiança à frente, também no total: passado
// esse total a porta fecha para toda a gente até a janela acabar.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const MAX_FAILURES_TOTAL = 60;
const failures = new Map<string, { count: number; until: number }>();
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

// A chave das assinaturas sai da password (sem mais segredos para configurar), por uma função
// lenta de propósito: quem apanhasse um cookie não conseguia testar passwords contra ele depressa.
// Calcula-se uma vez por password e fica guardada.
let signingKey: { secret: string; key: Buffer } | null = null;

function sign(payload: string, secret: string) {
  if (signingKey?.secret !== secret) signingKey = { secret, key: scryptSync(secret, 'painel:sessao', 32) };
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

/** Atrás do túnel ou de um proxy, o HTTPS acaba antes de chegar aqui: vale o cabeçalho. */
async function isHttps() {
  return (await headers()).get('x-forwarded-proto')?.split(',')[0]?.trim() === 'https';
}

export async function createSession() {
  const secret = password();
  if (!secret) return;
  const expires = String(Date.now() + MAX_AGE_S * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires, secret)}`, {
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

/** Tem um cookie válido? Tudo o que mexe no conteúdo começa por perguntar isto. */
export async function isAdmin(): Promise<boolean> {
  const secret = password();
  if (!secret) return false;
  const [expires, signature] = ((await cookies()).get(COOKIE)?.value ?? '').split('.');
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  return same(signature, sign(expires, secret));
}

/** O endereço de quem faz o pedido, para contar tentativas. */
export async function clientIp() {
  const h = await headers();
  return (h.get('cf-connecting-ip') ?? h.get('x-forwarded-for')?.split(',')[0] ?? h.get('x-real-ip') ?? 'local').trim();
}

function failuresOf(key: string) {
  const entry = failures.get(key);
  if (!entry) return 0;
  if (entry.until < Date.now()) {
    failures.delete(key);
    return 0;
  }
  return entry.count;
}

export function tooManyFailures(ip: string) {
  return failuresOf(ip) >= MAX_FAILURES || failuresOf(TOTAL) >= MAX_FAILURES_TOTAL;
}

export function recordFailure(ip: string) {
  const now = Date.now();
  // Não deixa o mapa crescer sem fim com endereços que já expiraram.
  if (failures.size > 5000) {
    for (const [key, entry] of failures) if (entry.until < now) failures.delete(key);
  }
  for (const key of [ip, TOTAL]) {
    const entry = failures.get(key);
    if (!entry || entry.until < now) failures.set(key, { count: 1, until: now + WINDOW_MS });
    else entry.count += 1;
  }
}

/** Entrou: as falhas desse endereço deixam de contar (as do total só saem com o tempo). */
export function clearFailures(ip: string) {
  failures.delete(ip);
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
