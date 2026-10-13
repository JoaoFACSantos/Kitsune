import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PreviewBar } from '@/components/PreviewBar';
import { HomeView } from '@/components/views/HomeView';
import { LinksView } from '@/components/views/LinksView';
import { PrivacyView } from '@/components/views/PrivacyView';
import { RulesView } from '@/components/views/RulesView';
import { isAdmin } from '@/lib/admin/auth';
import { getPreview } from '@/lib/content/site';
import { PREVIEW_PATH, type ViewProps } from '@/lib/preview';

// A pré-visualização do painel: as páginas do site com o que está no painel, guardado ou não
// (o rascunho que «Pré-visualizar» deixa na base de dados), e mesmo com o site em manutenção.
// /admin/ver é a página inicial, /admin/ver/links a de links, e assim por diante.
// Só entra quem tem sessão no painel: os outros vão para a entrada.

export const metadata: Metadata = { title: 'Pré-visualização', robots: { index: false, follow: false } };

// Depende do cookie de sessão e do rascunho: nunca vem de uma cache.
export const dynamic = 'force-dynamic';

/** A página pedida, desenhada com o que está no painel; null se o endereço não for de nenhuma. */
function view(page: string | undefined, props: ViewProps) {
  switch (page) {
    case undefined:
      return <HomeView {...props} />;
    case 'links':
      return <LinksView {...props} />;
    case 'regulamento':
      return <RulesView {...props} />;
    case 'privacidade':
      return <PrivacyView {...props} />;
    default:
      return null;
  }
}

export default async function PreviewPage({ params }: { params: Promise<{ path?: string[] }> }) {
  if (!(await isAdmin())) redirect('/admin');
  const { path = [] } = await params;
  const { site, changed, hidden } = await getPreview();
  const page = path.length > 1 ? null : view(path[0], { site, base: PREVIEW_PATH, preview: true });
  if (!page) notFound();

  return (
    <>
      {page}
      <PreviewBar changed={changed} hidden={hidden} />
    </>
  );
}
