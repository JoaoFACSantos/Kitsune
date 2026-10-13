import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { recordClick } from '@/lib/clicks';
import { brandSlug } from '@/lib/content/editable';
import { getSite } from '@/lib/content/site';

// Os links curtos das parcerias: o-site/zumub leva à Zumub e conta o clique (ver lib/clicks.ts).
// Servem para dizer em direto e pôr nas descrições; o painel mostra quantas vezes foram abertos.
// As páginas do site têm pasta própria e passam à frente disto: aqui só chega o que sobra, e o
// que não for o link de uma parceria dá a página de "não encontrado" de sempre.

// Cada clique é contado: a resposta nunca vem de uma cache.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ShortLink({ params, searchParams }: Props) {
  const slug = (await params).slug.toLowerCase();
  const brand = (await getSite()).partners.brands.find((b) => brandSlug(b) === slug);
  if (!brand) notFound();

  try {
    // A página de links (/links) marca os seus com "?de=links", para o painel os separar.
    await recordClick(await headers(), slug, (await searchParams).de === 'links' ? 'links' : 'curto');
  } catch (error) {
    // A contagem nunca estraga o link: fica por contar e pronto.
    console.error('[cliques] não consegui contar', error);
  }
  redirect(brand.url);
}
