import { sameOrigin } from '@/lib/admin/auth';
import { recordVisit } from '@/lib/visits';

// Conta uma visita ao site (ver lib/visits.ts). A página pede-o uma vez, ao abrir
// (components/VisitBeacon.tsx): a página em si vem da cache e não passa pelo servidor.
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Só os pedidos feitos pelo próprio site contam: um formulário ou um script noutro site, não.
  if (await sameOrigin(request)) {
    try {
      await recordVisit(request);
    } catch (error) {
      // A contagem nunca estraga a visita: fica por contar e pronto.
      console.error('[visitas] não consegui contar', error);
    }
  }
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
