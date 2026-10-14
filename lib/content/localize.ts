import { siteEn } from '@/content/site.en';
import type { SiteConfig } from '@/content/types';
import type { Lang } from '@/lib/i18n';

// A configuração numa língua. Em português é a de sempre; em inglês, os textos de
// content/site.en.ts e, em cada item escrito no painel, a versão inglesa (`en`) por cima.
// Sem dependências do servidor: o painel (no browser) também usa isto.

/** Os campos de cada item que têm versão inglesa (o painel e a validação usam os mesmos). */
export const TRANSLATED = {
  brand: ['category', 'perk', 'about', 'perks', 'cta', 'note'],
  giveaway: ['title', 'about', 'steps', 'cta'],
  gear: ['label', 'note', 'tags'],
  spec: ['label'],
  rule: ['title', 'text'],
  winner: ['prize'],
} as const;

const filled = (value: unknown) => (Array.isArray(value) ? value.length > 0 : Boolean(value));

/** Um item com a versão inglesa por cima: só os campos que lá têm texto; os outros ficam em português. */
export function inEnglish<T extends { en?: object }>(item: T): T {
  if (!item.en) return item;
  const own = Object.fromEntries(Object.entries(item.en).filter(([, value]) => filled(value)));
  return { ...item, ...own };
}

export function localize(site: SiteConfig, lang: Lang): SiteConfig {
  if (lang === 'pt') return site;
  const t = siteEn;
  return {
    ...site,
    role: t.role,
    tagline: t.tagline,
    description: t.description,
    hero: { ...site.hero, ...t.hero },
    clips: { ...site.clips, ...t.clips },
    setup: { ...site.setup, ...t.setup, gear: site.setup.gear.map(inEnglish), pc: site.setup.pc.map(inEnglish) },
    partners: { ...site.partners, ...t.partners, brands: site.partners.brands.map(inEnglish) },
    giveaways: {
      ...site.giveaways,
      ...t.giveaways,
      items: site.giveaways.items.map(inEnglish),
      rules: site.giveaways.rules.map(inEnglish),
      winners: site.giveaways.winners.map(inEnglish),
    },
    maintenance: { ...site.maintenance, ...t.maintenance },
    socialsSection: t.socialsSection,
  };
}
