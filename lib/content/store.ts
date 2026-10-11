import 'server-only';
import type { EditableContent } from '@/content/types';
import { db, ensureSchema, isMissingTable } from '@/lib/db';
import { UPLOAD_NAME } from './editable';

// Onde o painel guarda as coisas: a base de dados D1 da Cloudflare (as tabelas estão em lib/db.ts).
//
//   content   o conteúdo em vigor, no mesmo formato do antigo content.json
//   backups   cópias do conteúdo antes de cada gravação (ficam as últimas 30)
//   uploads   as imagens carregadas no painel
//
// Um Worker não tem disco: por isso é uma base de dados e não uma pasta. O resto do site só usa
// as funções exportadas aqui.

const KEEP_BACKUPS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
// Uma linha da D1 leva 2 MB no máximo.
export const MAX_UPLOAD_BYTES = 1_900_000;

/** O conteúdo guardado, tal como está na base de dados (ainda por validar), ou null se não houver. */
export async function readStored(): Promise<{ content: unknown; savedAt: string | null } | null> {
  try {
    const row = await db().prepare('SELECT data FROM content WHERE id = 1').first<{ data: string }>();
    if (!row) return null;
    const data: unknown = JSON.parse(row.data);
    if (typeof data !== 'object' || data === null || !('content' in data)) return null;
    const savedAt = 'savedAt' in data && typeof data.savedAt === 'string' ? data.savedAt : null;
    return { content: data.content, savedAt };
  } catch (error) {
    // Conteúdo estragado ou base de dados em baixo: o site continua de pé com o conteúdo de origem.
    if (!isMissingTable(error)) console.error('[conteúdo] não consegui ler', error);
    return null;
  }
}

/** Guarda a cópia de segurança do conteúdo atual, se existir. */
const backup = (savedAt: string) => db().prepare('INSERT INTO backups (saved_at, data) SELECT ?, data FROM content WHERE id = 1').bind(savedAt);

/** Grava o conteúdo (já validado). Devolve a data da gravação. */
export async function writeStored(content: EditableContent): Promise<string> {
  await ensureSchema();
  const savedAt = new Date().toISOString();
  // Vai tudo numa transação: se a gravação falhar a meio, o conteúdo bom fica intacto.
  await db().batch([
    backup(savedAt),
    db()
      .prepare('INSERT INTO content (id, data) VALUES (1, ?1) ON CONFLICT (id) DO UPDATE SET data = ?1')
      .bind(JSON.stringify({ version: 1, savedAt, content })),
    db().prepare('DELETE FROM backups WHERE id NOT IN (SELECT id FROM backups ORDER BY id DESC LIMIT ?)').bind(KEEP_BACKUPS),
  ]);
  return savedAt;
}

/** Apaga o conteúdo guardado: o site volta ao de origem. Fica uma cópia de segurança. */
export async function clearStored() {
  await ensureSchema();
  await db().batch([backup(new Date().toISOString()), db().prepare('DELETE FROM content')]);
}

export async function saveUpload(name: string, data: Uint8Array) {
  if (!UPLOAD_NAME.test(name)) throw new Error(`Nome de ficheiro inválido: ${name}`);
  if (data.byteLength > MAX_UPLOAD_BYTES) throw new Error(`Imagem grande de mais: ${data.byteLength} bytes`);
  await ensureSchema();
  await db()
    .prepare('INSERT INTO uploads (name, created_at, data) VALUES (?1, ?2, ?3) ON CONFLICT (name) DO UPDATE SET created_at = ?2')
    .bind(name, Date.now(), data)
    .run();
}

export async function readUpload(name: string): Promise<Uint8Array<ArrayBuffer> | null> {
  // O nome vem do URL: só passa o formato exato dos nossos ficheiros.
  if (!UPLOAD_NAME.test(name)) return null;
  try {
    const row = await db().prepare('SELECT data FROM uploads WHERE name = ?').bind(name).first<{ data: ArrayBuffer | number[] }>();
    return row ? new Uint8Array(row.data) : null;
  } catch (error) {
    if (!isMissingTable(error)) console.error('[conteúdo] não consegui ler a imagem', name, error);
    return null;
  }
}

/**
 * Apaga as imagens carregadas que o conteúdo já não usa. Ficam as de há menos de um dia:
 * podem ser de uma edição que ainda não foi guardada.
 */
export async function pruneUploads(inUse: Set<string>) {
  try {
    const { results } = await db()
      .prepare('SELECT name FROM uploads WHERE created_at < ?')
      .bind(Date.now() - DAY_MS)
      .all<{ name: string }>();
    const unused = results.filter(({ name }) => !inUse.has(name));
    if (unused.length) await db().batch(unused.map(({ name }) => db().prepare('DELETE FROM uploads WHERE name = ?').bind(name)));
  } catch (error) {
    // Fica para a próxima gravação.
    if (!isMissingTable(error)) console.error('[conteúdo] não consegui limpar as imagens', error);
  }
}
