import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Maintenance } from '@/components/Maintenance';
import { LinksView } from '@/components/views/LinksView';
import { site as defaults } from '@/content/site.config';
import { getSite } from '@/lib/content/site';
import { messages } from '@/lib/i18n';
import { alternates } from '@/lib/metadata';

// A página de links: tudo o que interessa a quem chega pela bio de uma rede, num ecrã de
// telemóvel. O desenho está em components/views/LinksView.tsx; a versão inglesa, em app/en/links.

export const metadata: Metadata = {
  title: messages('pt').meta.links,
  description: messages('pt').meta.linksDescription(defaults.name),
  alternates: alternates('links', 'pt'),
};

// Como a página inicial: regenera no máximo a cada 60 s (o estado do direto e os seguidores).
export const revalidate = 60;

export default async function LinksPage() {
  const site = await getSite();
  if (site.maintenance.active) return <Maintenance site={site} />;
  // Tirada do site na configuração (pages.links): é como se não existisse.
  if (!site.pages.links) notFound();
  return <LinksView site={site} />;
}
