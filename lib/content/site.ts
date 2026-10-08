import 'server-only';
import { cache } from 'react';
import { site as defaults } from '@/content/site.config';
import type { EditableContent, SiteConfig } from '@/content/types';
import { applyContent, pickEditable } from './editable';
import { readStored } from './store';
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
