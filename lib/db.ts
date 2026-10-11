import 'server-only';
import { env } from 'cloudflare:workers';

// A base de dados do painel: uma D1 da Cloudflare (o binding DB, em cloudflare.config.ts).
//
//   content          o conteúdo em vigor (uma linha só)
//   backups          cópias do conteúdo antes de cada gravação (ficam as últimas 30)
//   uploads          as imagens carregadas no painel
//   settings         valores que o site gera e guarda (a chave das sessões)
//   login_failures   tentativas falhadas de entrada no painel
//   visits           visitas e pessoas por dia (ver lib/visits.ts)
//   visitors         as pessoas que já contaram hoje (apagam-se no dia seguinte)
//
// As tabelas criam-se sozinhas na primeira gravação: não há migrações para correr.

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS backups (id INTEGER PRIMARY KEY AUTOINCREMENT, saved_at TEXT NOT NULL, data TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS uploads (name TEXT PRIMARY KEY, created_at INTEGER NOT NULL, data BLOB NOT NULL)',
  'CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS login_failures (key TEXT PRIMARY KEY, count INTEGER NOT NULL, until INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS visits (day TEXT PRIMARY KEY, views INTEGER NOT NULL, visitors INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS visitors (day TEXT NOT NULL, hash TEXT NOT NULL, PRIMARY KEY (day, hash)) WITHOUT ROWID',
];

export const db = () => env.DB;

// Fica só a nota de que já se fez (e não a promessa): num Worker, um pedido não pode ficar à
// espera de uma promessa que nasceu noutro.
let ready = false;

/** Cria as tabelas que faltarem. Chama-se antes de gravar; uma vez por instância chega. */
export async function ensureSchema() {
  if (ready) return;
  await env.DB.batch(SCHEMA.map((sql) => env.DB.prepare(sql)));
  ready = true;
}

/** Ainda ninguém gravou nada: a tabela não existe. Para quem lê, é o mesmo que estar vazia. */
export const isMissingTable = (error: unknown) => error instanceof Error && error.message.includes('no such table');
