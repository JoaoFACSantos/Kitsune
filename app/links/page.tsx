import type { Metadata } from 'next';
import { Maintenance } from '@/components/Maintenance';
import { LinksView } from '@/components/views/LinksView';
import { site as defaults } from '@/content/site.config';
import { getSite } from '@/lib/content/site';

// A página de links: tudo o que interessa a quem chega pela bio de uma rede, num ecrã de
// telemóvel. O desenho está em components/views/LinksView.tsx.

export const metadata: Metadata = {
  title: 'Links',
  description: `As redes, os códigos e as parcerias da ${defaults.name}, num só sítio.`,
  alternates: { canonical: '/links' },
};

// Como a página inicial: regenera no máximo a cada 60 s (o estado do direto e os seguidores).
export const revalidate = 60;

export default async function LinksPage() {
  const site = await getSite();
  if (site.maintenance.active) return <Maintenance title={site.maintenance.title} />;
  return <LinksView site={site} />;
}
