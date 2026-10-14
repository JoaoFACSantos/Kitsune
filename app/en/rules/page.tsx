import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Maintenance } from '@/components/Maintenance';
import { RulesView } from '@/components/views/RulesView';
import { site as defaults } from '@/content/site.config';
import { getSite } from '@/lib/content/site';
import { messages } from '@/lib/i18n';
import { inEnglish } from '@/lib/metadata';

// O regulamento dos giveaways em inglês (o português está em app/regulamento).

const m = messages('en').meta;

export const metadata: Metadata = inEnglish('rules', m.rules, m.rulesDescription(defaults.name));

export const revalidate = 3600;

export default async function RulesEnglish() {
  const site = await getSite();
  if (site.maintenance.active) return <Maintenance site={site} lang="en" />;
  if (!site.pages.rules) notFound();
  return <RulesView site={site} lang="en" />;
}
