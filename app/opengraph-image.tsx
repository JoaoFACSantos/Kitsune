import { site } from '@/content/site.config';
import { SHARE_SIZE, shareImage } from '@/lib/share-image';

// A imagem de partilha do site em português (o desenho está em lib/share-image.tsx).
export const alt = `${site.name} · ${site.role}`;
export const size = SHARE_SIZE;
export const contentType = 'image/png';
export const revalidate = 60;

export default function Image() {
  return shareImage('pt');
}
