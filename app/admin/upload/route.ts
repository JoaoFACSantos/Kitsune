import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { isAdmin, sameOrigin } from '@/lib/admin/auth';
import { saveUpload } from '@/lib/content/store';

// Envio de imagens do painel. A imagem é sempre reescrita em WebP, com 1600 px no máximo:
// sai sem metadados (localização, câmara), com um tamanho razoável e garantidamente uma imagem.

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_SIDE = 1600;
// SVG fica de fora: pode trazer código lá dentro.
const FORMATS = new Set(['jpeg', 'png', 'webp', 'avif', 'gif']);

const fail = (status: number, error: string) => Response.json({ error }, { status });

export async function POST(request: Request) {
  if (!(await isAdmin())) return fail(401, 'A sessão acabou. Entra outra vez.');
  if (!(await sameOrigin(request))) return fail(403, 'Pedido recusado.');
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BYTES + 64 * 1024) return fail(413, 'A imagem tem mais de 8 MB.');

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get('file');
  } catch {
    return fail(400, 'Não recebi a imagem.');
  }
  if (!(file instanceof File) || file.size === 0) return fail(400, 'Não recebi a imagem.');
  if (file.size > MAX_BYTES) return fail(413, 'A imagem tem mais de 8 MB.');

  try {
    const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 60_000_000 });
    const { format } = await image.metadata();
    if (!format || !FORMATS.has(format)) return fail(415, 'Formato não suportado. Usa JPG, PNG ou WebP.');
    const { data, info } = await image
      // Roda conforme a orientação da fotografia, que se perdia ao tirar os metadados.
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 86 })
      .toBuffer({ resolveWithObject: true });
    // O nome sai do conteúdo: a mesma imagem enviada duas vezes fica num só ficheiro.
    const name = `${createHash('sha256').update(data).digest('hex').slice(0, 16)}.webp`;
    await saveUpload(name, data);
    return Response.json({ url: `/uploads/${name}`, width: info.width, height: info.height });
  } catch (error) {
    console.error('[painel] imagem recusada', error);
    return fail(400, 'Não consegui ler essa imagem. Experimenta guardá-la outra vez em JPG ou PNG.');
  }
}
