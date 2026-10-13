import 'server-only';
import { revalidatePath } from 'next/cache';
import { site as defaults } from '@/content/site.config';
import { db, isMissingTable } from '@/lib/db';

// A abertura do site à hora marcada. Com a manutenção ligada e uma hora para abrir
// (maintenance.opensAt, no painel), o site mostra a página de abertura, com a contagem
// decrescente. Quando a contagem chega a zero, a página pergunta aqui se já pode abrir
// (POST /api/abrir): passada a hora, a manutenção fica desligada na base de dados e as páginas
// são geradas de novo. Quem lê o conteúdo já o vê aberto desde a hora certa
// (lib/content/site.ts); isto serve para as páginas guardadas em cache o mostrarem logo.

export type OpeningState = {
  /** O site está aberto. */
  open: boolean;
  /** Fechado com hora para abrir (ISO); null se está aberto, ou fechado sem hora marcada. */
  opensAt: string | null;
  /** O relógio do servidor (ms): o do aparelho de quem pergunta pode estar adiantado ou atrasado. */
  now: number;
};

const STATE =
  "SELECT json_extract(data, '$.content.maintenance.active') AS active, json_extract(data, '$.content.maintenance.opensAt') AS opensAt FROM content WHERE id = 1";

// Só muda se ainda estiver fechado e com a mesma hora: de muitos pedidos ao mesmo tempo, um só abre.
const OPEN =
  "UPDATE content SET data = json_set(json_remove(data, '$.content.maintenance.opensAt'), '$.content.maintenance.active', json('false')) " +
  "WHERE id = 1 AND json_extract(data, '$.content.maintenance.active') = 1 AND json_extract(data, '$.content.maintenance.opensAt') = ?";

/** Diz se o site está aberto e, se a hora marcada já passou, abre-o. */
export async function openIfDue(): Promise<OpeningState> {
  const now = Date.now();
  let row: { active: number | null; opensAt: string | null } | null = null;
  try {
    row = await db().prepare(STATE).first<{ active: number | null; opensAt: string | null }>();
  } catch (error) {
    if (!isMissingTable(error)) throw error;
  }
  // Sem nada guardado, vale o que está na configuração.
  if (!row) return { open: !defaults.maintenance.active, opensAt: null, now };
  if (!row.active) return { open: true, opensAt: null, now };

  const due = row.opensAt ? Date.parse(row.opensAt) : Number.NaN;
  if (Number.isNaN(due)) return { open: false, opensAt: null, now };
  if (due > now) return { open: false, opensAt: row.opensAt, now };

  const { meta } = await db().prepare(OPEN).bind(row.opensAt).run();
  // O site inteiro volta a ser gerado no próximo pedido, como quando se guarda no painel.
  if (meta.changes) revalidatePath('/', 'layout');
  return { open: true, opensAt: null, now };
}
