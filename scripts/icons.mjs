// Faz os ícones do site a partir da arte do topo (hero.photo): as duas caras, a dela e a da raposa.
//   node scripts/icons.mjs
// Escreve em /public: icon.png (o do separador do browser), apple-icon.png (ecrã inicial do
// iPhone) e favicon.ico (para quem só procura esse nome). Se a arte mudar, acerta o recorte
// aqui em baixo e corre isto outra vez. Os ícones estão declarados em app/layout.tsx.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(root, 'public/media/kitsune.jpg');
// O quadrado da arte que fica no ícone, em píxeis da imagem original (1254 × 1254).
const CROP = { left: 40, top: 130, width: 860, height: 860 };
// Cantos redondos, como fração do lado. O da Apple vai quadrado: o iPhone arredonda-o ele.
const RADIUS = 0.22;

const square = (size) => sharp(SOURCE).extract(CROP).resize(size, size, { kernel: 'lanczos3' });

async function rounded(size) {
  const r = Math.round(size * RADIUS);
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}"/></svg>`);
  return square(size)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Um .ico com várias imagens PNG lá dentro (todos os browsers de hoje as leem). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map(({ data }) => data)]);
}

fs.writeFileSync(path.join(root, 'public/icon.png'), await rounded(96));
fs.writeFileSync(path.join(root, 'public/apple-icon.png'), await square(180).flatten({ background: '#140a18' }).png({ compressionLevel: 9 }).toBuffer());
fs.writeFileSync(path.join(root, 'public/favicon.ico'), ico([{ size: 32, data: await rounded(32) }, { size: 48, data: await rounded(48) }]));
for (const name of ['icon.png', 'apple-icon.png', 'favicon.ico']) console.log(name, fs.statSync(path.join(root, 'public', name)).size, 'bytes');
