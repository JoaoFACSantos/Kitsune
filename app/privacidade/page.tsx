import type { Metadata } from 'next';
import { Maintenance } from '@/components/Maintenance';
import { PrivacyView } from '@/components/views/PrivacyView';
import { site as defaults } from '@/content/site.config';
import { getSite } from '@/lib/content/site';

// O que o site guarda sobre quem o visita. O texto está em components/views/PrivacyView.tsx.

export const metadata: Metadata = {
  title: 'Privacidade',
  description: `O que o site da ${defaults.name} guarda sobre quem o visita, e o que não guarda.`,
  alternates: { canonical: '/privacidade' },
};

export const revalidate = 3600;

export default async function PrivacyPage() {
  const site = await getSite();
  if (site.maintenance.active) return <Maintenance title={site.maintenance.title} />;
  return <PrivacyView site={site} />;
}
