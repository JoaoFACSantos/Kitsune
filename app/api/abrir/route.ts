import { sameOrigin } from '@/lib/admin/auth';
import { openIfDue } from '@/lib/content/opening';

// A página de abertura pergunta aqui se o site já abriu, quando a contagem chega a zero
// (components/Countdown.tsx). Passada a hora marcada, é este pedido que o abre (ver
// lib/content/opening.ts). Antes da hora não faz nada: só diz quanto falta.
export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  // Só os pedidos feitos pelo próprio site: um script noutro site não vem aqui bater.
  if (!(await sameOrigin(request))) return new Response(null, { status: 403, headers });
  try {
    return Response.json(await openIfDue(), { headers });
  } catch (error) {
    console.error('[abertura] não consegui ver se o site já abriu', error);
    return new Response(null, { status: 503, headers });
  }
}
