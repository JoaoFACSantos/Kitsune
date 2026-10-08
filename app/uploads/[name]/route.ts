import { readUpload } from '@/lib/content/store';

// As imagens carregadas no painel. Vivem na pasta de dados, ao lado do conteúdo guardado
// (e não em /public): uma cópia dessa pasta leva tudo, e uma instalação nova do site não lhes toca.

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const data = await readUpload((await params).name);
  if (!data) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': 'image/webp',
      // O nome é o hash do conteúdo: o ficheiro nunca muda, pode ficar em cache para sempre.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
