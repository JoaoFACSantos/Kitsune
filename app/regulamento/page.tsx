import type { Metadata } from 'next';
import { Maintenance } from '@/components/Maintenance';
import { RulesView } from '@/components/views/RulesView';
import { site as defaults } from '@/content/site.config';
import { getSite } from '@/lib/content/site';

// O regulamento dos giveaways e a lista de quem já ganhou. O desenho está em
// components/views/RulesView.tsx.

export const metadata: Metadata = {
  title: 'Regulamento dos giveaways',
  description: `As regras dos giveaways da ${defaults.name}: quem pode participar, como se escolhe quem ganha e como chega o prémio.`,
  alternates: { canonical: '/regulamento' },
};

// O texto só muda quando se guarda no painel, e aí a página é gerada de novo.
export const revalidate = 3600;

export default async function RulesPage() {
  const site = await getSite();
  if (site.maintenance.active) return <Maintenance title={site.maintenance.title} />;
  return <RulesView site={site} />;
}
