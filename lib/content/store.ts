import 'server-only';
import { copyFile, mkdir, readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { EditableContent } from '@/content/types';
import { UPLOAD_NAME } from './editable';

// Onde o painel guarda as coisas: uma pasta no disco do servidor (CONTENT_DIR, ou ./data).
//
//   content.json   o conteúdo em vigor
//   backups/       cópias do content.json antes de cada gravação (ficam as últimas 30)
//   uploads/       as imagens carregadas no painel
//
// Precisa de um disco que não se apague: um VPS ou um PC servem. Em alojamentos sem disco
// (Vercel, Cloudflare Workers) isto não grava: aí é preciso trocar este ficheiro por um que
// fale com uma base de dados. O resto do site só usa as funções exportadas aqui.

const ROOT = path.resolve(process.env.CONTENT_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), 'data'));
const FILE = path.join(ROOT, 'content.json');
const BACKUPS = path.join(ROOT, 'backups');
const UPLOADS = path.join(ROOT, 'uploads');
const KEEP_BACKUPS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const isMissing = (error: unknown) => (error as NodeJS.ErrnoException | null)?.code === 'ENOENT';

/** O conteúdo guardado, tal como está no disco (ainda por validar), ou null se não houver. */
export async function readStored(): Promise<{ content: unknown; savedAt: string | null } | null> {
  try {
    const data: unknown = JSON.parse(await readFile(FILE, 'utf8'));
    if (typeof data !== 'object' || data === null || !('content' in data)) return null;
    const savedAt = 'savedAt' in data && typeof data.savedAt === 'string' ? data.savedAt : null;
    return { content: data.content, savedAt };
  } catch (error) {
    // Ficheiro estragado: o site continua de pé com o conteúdo de origem.
    if (!isMissing(error)) console.error('[conteúdo] não consegui ler', FILE, error);
    return null;
  }
}

/** Guarda a cópia de segurança do ficheiro atual, se existir. */
async function backup() {
  await mkdir(BACKUPS, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  try {
    await copyFile(FILE, path.join(BACKUPS, `content-${stamp}.json`));
  } catch (error) {
    if (!isMissing(error)) throw error;
    return;
  }
  const old = (await readdir(BACKUPS)).filter((name) => name.startsWith('content-')).sort();
  await Promise.all(old.slice(0, -KEEP_BACKUPS).map((name) => unlink(path.join(BACKUPS, name)).catch(() => undefined)));
}

/** Grava o conteúdo (já validado). Devolve a data da gravação. */
export async function writeStored(content: EditableContent): Promise<string> {
  await mkdir(ROOT, { recursive: true });
  await backup();
  const savedAt = new Date().toISOString();
  // Escreve ao lado e troca no fim: se a gravação falhar a meio, o ficheiro bom fica intacto.
  const temp = `${FILE}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify({ version: 1, savedAt, content }, null, 2)}\n`, 'utf8');
  await rename(temp, FILE);
  return savedAt;
}

/** Apaga o conteúdo guardado: o site volta ao de origem. Fica uma cópia de segurança. */
export async function clearStored() {
  await backup();
  await unlink(FILE).catch((error) => {
    if (!isMissing(error)) throw error;
  });
}

export async function saveUpload(name: string, data: Buffer) {
  if (!UPLOAD_NAME.test(name)) throw new Error(`Nome de ficheiro inválido: ${name}`);
  await mkdir(UPLOADS, { recursive: true });
  await writeFile(path.join(UPLOADS, name), data);
}

export async function readUpload(name: string): Promise<Buffer | null> {
  // O nome vem do URL: só passa o formato exato dos nossos ficheiros, sem barras nem "..".
  if (!UPLOAD_NAME.test(name)) return null;
  try {
    return await readFile(path.join(UPLOADS, name));
  } catch (error) {
    if (!isMissing(error)) console.error('[conteúdo] não consegui ler a imagem', name, error);
    return null;
  }
}

/**
 * Apaga as imagens carregadas que o conteúdo já não usa. Ficam as de há menos de um dia:
 * podem ser de uma edição que ainda não foi guardada.
 */
export async function pruneUploads(inUse: Set<string>) {
  let names: string[];
  try {
    names = await readdir(UPLOADS);
  } catch {
    return;
  }
  await Promise.all(
    names
      .filter((name) => UPLOAD_NAME.test(name) && !inUse.has(name))
      .map(async (name) => {
        const file = path.join(UPLOADS, name);
        try {
          if (Date.now() - (await stat(file)).mtimeMs > DAY_MS) await unlink(file);
        } catch {
          // Já não existe, ou está em uso: fica para a próxima.
        }
      }),
  );
}
