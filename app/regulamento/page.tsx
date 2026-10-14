import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Maintenance } from '@/components/Maintenance';
import { RulesView } from '@/components/views/RulesView';
import { site as defaults } from '@/content/site.config';
import { getSite } from '@/lib/content/site';
import { messages } from '@/lib/i18n';
import { alternates } from '@/lib/metadata';

// O regulamento dos giveaways e a lista de quem já ganhou. O desenho está em
// components/views/RulesView.tsx; a versão inglesa, em app/en/rules.

export const metadata: Metadata = {
  title: messages('pt').meta.rules,
  description: messages('pt').meta.rulesDescription(defaults.name),
  alternates: alternates('rules', 'pt'),
};

// O texto só muda quando se guarda no painel, e aí a página é gerada de novo.
export const revalidate = 3600;

export default async function RulesPage() {
  const site = await getSite();
  if (site.maintenance.active) return <Maintenance site={site} />;
  // Tirado do site na configuração (pages.rules): é como se não existisse.
  if (!site.pages.rules) notFound();
  return <RulesView site={site} />;
}
