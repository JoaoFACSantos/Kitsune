import type { SiteConfig } from '@/content/types';
import type { Lang } from '@/lib/i18n';

// A pré-visualização do painel: as páginas do site desenhadas com o que está no painel, guardado
// ou não, para a streamer ver e experimentar antes de publicar (e com o site em manutenção).
// Sem dependências do servidor: o painel (no browser) também usa isto.

/**
 * Onde a pré-visualização vive (ver app/admin/ver). Fica dentro de /admin de propósito: o cookie
 * da sessão só vai nos pedidos do painel, e os cabeçalhos do painel valem aqui também.
 */
export const PREVIEW_PATH = '/admin/ver';

/** O que cada página recebe para se desenhar: no site e na pré-visualização é o mesmo desenho. */
export type ViewProps = {
  /** A configuração a mostrar (em português): a publicada ou, na pré-visualização, a que está no painel. */
  site: SiteConfig;
  /** A língua da página: o português na raiz, o inglês em /en (lib/i18n.ts). */
  lang?: Lang;
  /** Onde estão as outras páginas: '' no site, PREVIEW_PATH na pré-visualização (os links ficam lá dentro). */
  base?: string;
  /** É a pré-visualização: não conta visitas nem cliques. */
  preview?: boolean;
};
