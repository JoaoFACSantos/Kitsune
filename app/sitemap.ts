import type { MetadataRoute } from 'next';
import { site } from '@/content/site.config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    // As páginas tiradas do site (pages, na configuração) não entram.
    ...(site.pages.links ? [{ url: `${site.url}/links`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 }] : []),
    ...(site.pages.rules ? [{ url: `${site.url}/regulamento`, changeFrequency: 'monthly' as const, priority: 0.3 }] : []),
    { url: `${site.url}/privacidade`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
