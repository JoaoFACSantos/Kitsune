import type { MetadataRoute } from 'next';
import { site } from '@/content/site.config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }];
}
