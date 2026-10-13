import { env } from 'cloudflare:workers';
import { site } from '@/content/site.config';

// O vídeo do hero (hero.photoVideo), servido pelo Worker e não como ficheiro estático: os ficheiros
// estáticos da Cloudflare ignoram os pedidos parciais (Range), e o Safari (iPhone incluído) só toca
// vídeo de um servidor que lhes responda com o bocado pedido (206).

// Sempre pelo Worker, sem a cache da Cloudflare à frente: num endereço que ela ainda não viu, a
// cache tira o Range do pedido e o primeiro visitante recebia o ficheiro inteiro (200) em vez do
// bocado que pediu (206). O browser guarda o vídeo na mesma, pelo Cache-Control lá em baixo.
export const dynamic = 'force-dynamic';

const fail = (status: number, headers?: HeadersInit) => new Response(null, { status, headers });

export async function GET(request: Request) {
  const path = site.hero.photoVideo;
  if (!path) return fail(404);
  const url = new URL(path, request.url);
  let file = await env.ASSETS.fetch(url);
  // Em desenvolvimento o binding não tem os ficheiros de /public: vão buscar-se ao próprio servidor.
  if (!file.ok) file = await fetch(url);
  if (!file.ok) return fail(404);

  const bytes = await file.arrayBuffer();
  const total = bytes.byteLength;
  const headers = {
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    // Um dia no browser. Se o vídeo for trocado, a página pede-o por outro endereço (o "v" muda).
    'Cache-Control': 'public, max-age=86400',
    'X-Content-Type-Options': 'nosniff',
  };

  // "bytes=0-1", "bytes=500-" ou "bytes=-500" (os últimos 500).
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '');
  if (!range || (range[1] === '' && range[2] === '')) return new Response(bytes, { headers });
  const start = range[1] === '' ? Math.max(0, total - Number(range[2])) : Number(range[1]);
  const end = range[1] === '' || range[2] === '' ? total - 1 : Math.min(Number(range[2]), total - 1);
  if (start > end || start >= total) return fail(416, { 'Content-Range': `bytes */${total}` });
  return new Response(bytes.slice(start, end + 1), { status: 206, headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${total}` } });
}
