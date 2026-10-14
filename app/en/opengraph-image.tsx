import { site } from '@/content/site.config';
import { siteEn } from '@/content/site.en';
import { SHARE_SIZE, shareImage } from '@/lib/share-image';

// A imagem de partilha das páginas em inglês (o desenho está em lib/share-image.tsx).
export const alt = `${site.name} · ${siteEn.role}`;
export const size = SHARE_SIZE;
export const contentType = 'image/png';
export const revalidate = 60;

export default function Image() {
  return shareImage('en');
}
