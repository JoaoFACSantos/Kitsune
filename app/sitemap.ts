import type { MetadataRoute } from 'next';
import { site } from '@/content/site.config';
import { type Routes, routesFor } from '@/lib/i18n';

// Cada página nas duas línguas, cada uma com o endereço da outra (hreflang).
// As páginas tiradas do site (pages, na configuração) não entram.

type Entry = { page: keyof Routes; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number; fresh?: boolean };

const PAGES: Entry[] = [
  { page: 'home', changeFrequency: 'daily', priority: 1, fresh: true },
  ...(site.pages.links ? [{ page: 'links', changeFrequency: 'weekly', priority: 0.6, fresh: true } as Entry] : []),
  ...(site.pages.rules ? [{ page: 'rules', changeFrequency: 'monthly', priority: 0.3 } as Entry] : []),
  { page: 'privacy', changeFrequency: 'yearly', priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${site.url}${path === '/' ? '' : path}`;
  return PAGES.flatMap(({ page, changeFrequency, priority, fresh }) => {
    const languages = { 'pt-PT': url(routesFor('pt')[page]), en: url(routesFor('en')[page]) };
    return (['pt', 'en'] as const).map((lang) => ({
      url: url(routesFor(lang)[page]),
      ...(fresh ? { lastModified: new Date() } : {}),
      changeFrequency,
      priority,
      alternates: { languages },
    }));
  });
}
