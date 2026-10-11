import { createHash } from 'node:crypto';
import { env } from 'cloudflare:workers';
import { isAdmin, sameOrigin } from '@/lib/admin/auth';
import { MAX_UPLOAD_BYTES, saveUpload } from '@/lib/content/store';

// Envio de imagens do painel. A imagem é sempre reescrita em WebP, com 1600 px no máximo:
// sai sem metadados (localização, câmara), com um tamanho razoável e garantidamente uma imagem.
// Quem a reescreve é o serviço de imagens da Cloudflare (o binding IMAGES): um Worker não tem
// tempo de processador para o fazer.
//
// O ficheiro vem tal e qual no corpo do pedido, e não num formulário: um POST com
// multipart/form-data é tratado como uma possível ação do servidor, com 1 MB de limite.

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_SIDE = 1600;
const MAX_PIXELS = 60_000_000;
// SVG fica de fora: pode trazer código lá dentro.
const FORMATS = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
// Da melhor para a pior, até a imagem caber numa linha da base de dados.
const QUALITIES = [86, 70, 50];

const fail = (status: number, error: string) => Response.json({ error }, { status });

const stream = (bytes: Uint8Array<ArrayBuffer>) => new Blob([bytes]).stream();

export async function POST(request: Request) {
  if (!(await isAdmin())) return fail(401, 'A sessão acabou. Entra outra vez.');
  if (!(await sameOrigin(request))) return fail(403, 'Pedido recusado.');
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BYTES) return fail(413, 'A imagem tem mais de 8 MB.');

  let source: Uint8Array<ArrayBuffer>;
  try {
    source = new Uint8Array(await request.arrayBuffer());
  } catch {
    return fail(400, 'Não recebi a imagem.');
  }
  if (source.byteLength === 0) return fail(400, 'Não recebi a imagem.');
  if (source.byteLength > MAX_BYTES) return fail(413, 'A imagem tem mais de 8 MB.');

  try {
    const original = await env.IMAGES.info(stream(source));
    if (!FORMATS.has(original.format) || !('width' in original)) return fail(415, 'Formato não suportado. Usa JPG, PNG ou WebP.');
    if (original.width * original.height > MAX_PIXELS) return fail(413, 'A imagem é grande de mais. Reduz-lhe o tamanho e tenta outra vez.');

    let data = source;
    for (const quality of QUALITIES) {
      const result = await env.IMAGES.input(stream(source))
        // Roda conforme a orientação da fotografia e deita fora os metadados; de um GIF fica a primeira imagem.
        .transform({ width: MAX_SIDE, height: MAX_SIDE, fit: 'scale-down' })
        .output({ format: 'image/webp', quality, anim: false });
      data = new Uint8Array(await result.response().arrayBuffer());
      if (data.byteLength <= MAX_UPLOAD_BYTES) break;
    }
    if (data.byteLength > MAX_UPLOAD_BYTES) return fail(413, 'A imagem ficou pesada de mais. Reduz-lhe o tamanho e tenta outra vez.');

    const info = await env.IMAGES.info(stream(data));
    if (info.format !== 'image/webp' || !('width' in info)) throw new Error(`O serviço de imagens devolveu ${info.format}`);
    // O nome sai do conteúdo: a mesma imagem enviada duas vezes fica num só ficheiro.
    const name = `${createHash('sha256').update(data).digest('hex').slice(0, 16)}.webp`;
    await saveUpload(name, data);
    return Response.json({ url: `/uploads/${name}`, width: info.width, height: info.height });
  } catch (error) {
    console.error('[painel] imagem recusada', error);
    return fail(400, 'Não consegui ler essa imagem. Experimenta guardá-la outra vez em JPG ou PNG.');
  }
}
