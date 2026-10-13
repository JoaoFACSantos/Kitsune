import { sameOrigin } from '@/lib/admin/auth';
import { recordClick } from '@/lib/clicks';
import { brandSlug } from '@/lib/content/editable';
import { getSite } from '@/lib/content/site';

// Conta um clique no botão de uma parceria, no próprio site (ver lib/clicks.ts). O botão leva
// direto à marca; o site só avisa aqui que foi clicado (lib/track.ts).
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Só os pedidos feitos pelo próprio site, e só para uma parceria que exista.
  if (await sameOrigin(request)) {
    try {
      const slug = (await request.text()).trim().slice(0, 40);
      if ((await getSite()).partners.brands.some((b) => brandSlug(b) === slug)) await recordClick(request.headers, slug, 'site');
    } catch (error) {
      console.error('[cliques] não consegui contar', error);
    }
  }
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
