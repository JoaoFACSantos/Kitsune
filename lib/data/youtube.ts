import 'server-only';

// Subscritores do YouTube pela Data API v3 (chave de API simples, sem login). Cache de 1 h.
// O YouTube arredonda o número a 3 algarismos significativos.

type ChannelList = { items?: { statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean } }[] };

/**
 * Procura o canal por YOUTUBE_CHANNEL_ID (o mais fiável) ou, se não houver, pelo handle.
 * Devolve null sem chave, se o canal não for encontrado ou se esconder os subscritores.
 */
export async function getYoutubeSubscribers(handle: string): Promise<number | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const lookup = channelId ? `id=${encodeURIComponent(channelId)}` : `forHandle=${encodeURIComponent(handle.replace(/^@/, ''))}`;
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&${lookup}&key=${encodeURIComponent(key)}`, {
    next: { revalidate: 3_600 },
  });
  if (!res.ok) throw new Error(`YouTube channels: ${res.status}`);
  const stats = ((await res.json()) as ChannelList).items?.[0]?.statistics;
  if (!stats || stats.hiddenSubscriberCount || !stats.subscriberCount) return null;
  return Number(stats.subscriberCount);
}
