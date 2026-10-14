import type { Metadata } from 'next';
import { Maintenance } from '@/components/Maintenance';
import { PrivacyView } from '@/components/views/PrivacyView';
import { site as defaults } from '@/content/site.config';
import { getSite } from '@/lib/content/site';
import { messages } from '@/lib/i18n';
import { alternates } from '@/lib/metadata';

// O que o site guarda sobre quem o visita. O texto está em components/views/PrivacyView.tsx; a
// versão inglesa, em app/en/privacy.

export const metadata: Metadata = {
  title: messages('pt').meta.privacy,
  description: messages('pt').meta.privacyDescription(defaults.name),
  alternates: alternates('privacy', 'pt'),
};

export const revalidate = 3600;

export default async function PrivacyPage() {
  const site = await getSite();
  if (site.maintenance.active) return <Maintenance site={site} />;
  return <PrivacyView site={site} />;
}
