import 'server-only';
import { cache } from 'react';
import { site as defaults } from '@/content/site.config';
import type { EditableContent, SiteConfig } from '@/content/types';
import { applyContent, pickEditable } from './editable';
import { readDraft, readStored } from './store';
import { validateContent } from './validate';

/** O conteúdo de origem, o de `content/site.config.ts`. */
export const defaultContent = (): EditableContent => pickEditable(defaults);

/**
 * O conteúdo que o painel edita: o guardado ou, se ainda não houver nada guardado, o de origem.
 * O que vem do disco passa sempre pela validação: um ficheiro mexido à mão ou de uma versão
 * antiga do site não o parte.
 */
export const getContent = cache(async (): Promise<{ content: EditableContent; savedAt: string | null }> => {
  const stored = await readStored();
  if (!stored) return { content: defaultContent(), savedAt: null };
  const { content } = validateContent(stored.content, defaultContent(), defaults.platform);
  return { content, savedAt: stored.savedAt };
});

/** A configuração do site com o que foi mudado no painel. É isto que as páginas devem ler. */
export const getSite = cache(async (): Promise<SiteConfig> => applyContent(defaults, (await getContent()).content));

export type Preview = {
  /** A configuração com o rascunho do painel ou, sem rascunho, com o que está guardado. */
  site: SiteConfig;
  /** O rascunho é diferente do que está guardado: há alterações por publicar. */
  changed: boolean;
  /** O site está em manutenção: quem o abre vê só o aviso, e não isto. */
  hidden: boolean;
};

/** O que a pré-visualização do painel mostra (ver app/admin/ver). Só para quem tem sessão no painel. */
export async function getPreview(): Promise<Preview> {
  const [{ content: saved }, stored] = await Promise.all([getContent(), readDraft()]);
  const draft = stored === null ? saved : validateContent(stored, defaultContent(), defaults.platform).content;
  return {
    site: applyContent(defaults, draft),
    // Os dois passaram pela mesma validação: iguais, dão o mesmo texto.
    changed: JSON.stringify(draft) !== JSON.stringify(saved),
    hidden: saved.maintenance.active,
  };
}
