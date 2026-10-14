import type { Metadata } from 'next';
import { Maintenance } from '@/components/Maintenance';
import { HomeView } from '@/components/views/HomeView';
import { siteEn } from '@/content/site.en';
import { getSite } from '@/lib/content/site';
import { inEnglish } from '@/lib/metadata';

// A página inicial em inglês: a mesma de app/page.tsx, com os textos em inglês (lib/i18n.ts,
// content/site.en.ts e a versão inglesa do que se escreve no painel).

export const metadata: Metadata = inEnglish('home', null, siteEn.description);

export const revalidate = 60;

export default async function HomeEnglish() {
  const site = await getSite();
  if (site.maintenance.active) return <Maintenance site={site} lang="en" />;
  return <HomeView site={site} lang="en" />;
}
