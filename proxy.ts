import { type NextRequest, NextResponse } from 'next/server';

// Corre antes de cada pedido que chega ao Worker. Quem vem por "www." é mandado para o endereço
// sem ele, e quem vem por HTTP (sem cifra) é mandado para HTTPS: sem isto, a password do painel
// podia viajar às claras para quem escrevesse o endereço com "http://".
// (O cabeçalho Strict-Transport-Security, em next.config.ts, trata do resto: depois da primeira
// visita o browser já nem tenta HTTP.)

/** O próprio computador ou um endereço IP da rede de casa: desenvolvimento, fica em HTTP. */
const LOCAL = /^(?:localhost|\[[0-9a-f:]+\]|\d{1,3}(?:\.\d{1,3}){3})$/i;

export function proxy(request: NextRequest) {
  const { protocol, hostname, host, pathname, search } = request.nextUrl;
  // "www." vai para o endereço sem ele: o site (e o cookie do painel) ficam com um endereço só.
  if (hostname.startsWith('www.')) return NextResponse.redirect(`https://${host.slice(4)}${pathname}${search}`, 308);
  // Só redireciona com os dois sinais de acordo: o endereço do pedido e o que a Cloudflare diz.
  const forwarded = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  if (protocol !== 'http:' || (forwarded && forwarded !== 'http') || LOCAL.test(hostname)) return NextResponse.next();
  return NextResponse.redirect(`https://${host}${pathname}${search}`, 308);
}
