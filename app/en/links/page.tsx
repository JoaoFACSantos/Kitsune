import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Maintenance } from '@/components/Maintenance';
import { LinksView } from '@/components/views/LinksView';
import { site as defaults } from '@/content/site.config';
import { getSite } from '@/lib/content/site';
import { messages } from '@/lib/i18n';
import { inEnglish } from '@/lib/metadata';

// A página de links em inglês (a portuguesa está em app/links).

const m = messages('en').meta;

export const metadata: Metadata = inEnglish('links', m.links, m.linksDescription(defaults.name));

export const revalidate = 60;

export default async function LinksEnglish() {
  const site = await getSite();
  if (site.maintenance.active) return <Maintenance site={site} lang="en" />;
  if (!site.pages.links) notFound();
  return <LinksView site={site} lang="en" />;
}
