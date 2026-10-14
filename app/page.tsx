import type { Metadata } from 'next';
import { Maintenance } from '@/components/Maintenance';
import { HomeView } from '@/components/views/HomeView';
import { getSite } from '@/lib/content/site';
import { alternates } from '@/lib/metadata';

// A versão inglesa está em app/en/page.tsx.
export const metadata: Metadata = { alternates: alternates('home', 'pt') };

// ISR: a página é estática e regenera no máximo a cada 60 s (estado do direto).
// Quando se guarda alguma coisa no painel (/admin), regenera logo.
export const revalidate = 60;

export default async function Home() {
  // A configuração com o que foi mudado no painel.
  const site = await getSite();
  // Em manutenção (ligada no painel): só o aviso, sem ir buscar mais nada.
  if (site.maintenance.active) return <Maintenance site={site} />;
  return <HomeView site={site} />;
}
