import type { Metadata } from 'next';
import { Maintenance } from '@/components/Maintenance';
import { PrivacyView } from '@/components/views/PrivacyView';
import { site as defaults } from '@/content/site.config';
import { getSite } from '@/lib/content/site';
import { messages } from '@/lib/i18n';
import { inEnglish } from '@/lib/metadata';

// A página de privacidade em inglês (a portuguesa está em app/privacidade).

const m = messages('en').meta;

export const metadata: Metadata = inEnglish('privacy', m.privacy, m.privacyDescription(defaults.name));

export const revalidate = 3600;

export default async function PrivacyEnglish() {
  const site = await getSite();
  if (site.maintenance.active) return <Maintenance site={site} lang="en" />;
  return <PrivacyView site={site} lang="en" />;
}
