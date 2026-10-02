import type { Platform } from '@/content/types';

// Players das plataformas para ver no próprio site.
// `host` é o domínio do site (location.hostname): a Twitch só deixa embutir com ele em `parent`.

/** Player do direto, ou null se a plataforma não tiver um a partir do handle. */
export function liveEmbedUrl(platform: Platform, handle: string, host: string) {
  const channel = encodeURIComponent(handle);
  if (platform === 'twitch') return `https://player.twitch.tv/?channel=${channel}&parent=${host}&autoplay=true`;
  if (platform === 'kick') return `https://player.kick.com/${channel}?autoplay=true`;
  return null; // O YouTube pede o ID do canal, não o handle.
}

/** Player de um clip a partir do `embedUrl` que a API devolve. */
export function clipEmbedUrl(embedUrl: string, host: string) {
  const url = new URL(embedUrl);
  if (url.hostname.endsWith('twitch.tv')) {
    url.searchParams.set('parent', host);
    url.searchParams.set('autoplay', 'true');
  }
  return url.toString();
}
