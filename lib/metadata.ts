import type { Metadata } from 'next';
import { site } from '@/content/site.config';
import { siteEn } from '@/content/site.en';
import { type Lang, type Routes, routesFor } from '@/lib/i18n';

// Os metadados das páginas nas duas línguas. Os de base (em português) estão em app/layout.tsx;
// cada página acrescenta os seus e, em inglês, troca o título, a descrição e a partilha nas redes.

type Page = keyof Routes;

/** Esta página nas duas línguas, para os motores de busca saberem que são a mesma (hreflang). */
export function alternates(page: Page, lang: Lang): NonNullable<Metadata['alternates']> {
  const pt = routesFor('pt')[page];
  return { canonical: routesFor(lang)[page], languages: { 'pt-PT': pt, en: routesFor('en')[page], 'x-default': pt } };
}

/** Os metadados de uma página em inglês. Sem título, é a página inicial ("Kitsune · Streamer & content creator"). */
export function inEnglish(page: Page, title: string | null, description: string): Metadata {
  const full = title ? `${title} · ${site.name}` : `${site.name} · ${siteEn.role}`;
  return {
    title: title ?? { absolute: full },
    description,
    alternates: alternates(page, 'en'),
    openGraph: { type: 'profile', locale: 'en_GB', url: routesFor('en')[page], siteName: site.name, title: full, description },
    twitter: { card: 'summary_large_image', title: full, description, creator: site.socials.find((s) => s.id === 'x')?.handle },
  };
}
