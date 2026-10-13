import type { MetadataRoute } from 'next';
import { site } from '@/content/site.config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${site.url}/links`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${site.url}/regulamento`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${site.url}/privacidade`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
