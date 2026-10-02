import 'server-only';
import { site } from '@/content/site.config';
import { mockSource } from './mock';
import { twitchSource } from './twitch';
import { getYoutubeSubscribers } from './youtube';
import type { Clip, SocialId } from '@/content/types';
import type { DiscordInfo, LiveStatus, StreamSource } from './types';

export type { DiscordInfo, LiveStatus } from './types';

// Escolhe o adaptador da plataforma principal. Sem chaves, usa os dados mock.
// Para YouTube ou Kick: criar um adaptador com a mesma interface e acrescentá-lo aqui.
function source(): StreamSource {
  if (site.platform === 'twitch' && process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET) {
    return twitchSource;
  }
  return mockSource;
}

/** Nunca falha: se a API falhar, o site mostra offline. */
export async function getLiveStatus(): Promise<LiveStatus> {
  try {
    return await source().getLiveStatus();
  } catch (error) {
    console.error('[dados] estado do direto', error);
    return { live: false };
  }
}

/** Os clips mais vistos. Se a API falhar ou o canal ainda não tiver clips, usa os da configuração. */
export async function getClips(limit = 4): Promise<Clip[]> {
  try {
    const clips = await source().getClips(limit);
    if (clips.length) return clips;
  } catch (error) {
    console.error('[dados] clips', error);
  }
  return site.clips.items.slice(0, limit);
}

/**
 * Seguidores reais das redes que os dão sem login: a plataforma principal e o YouTube.
 * Nas outras (e se uma API falhar) fica o valor `followers` da configuração.
 */
export async function getFollowers(): Promise<Partial<Record<SocialId, number>>> {
  const youtube = site.socials.find((s) => s.id === 'youtube');
  const [main, subscribers] = await Promise.allSettled([
    source().getFollowers(),
    youtube ? getYoutubeSubscribers(youtube.handle) : Promise.resolve(null),
  ]);
  const counts: Partial<Record<SocialId, number>> = {};
  if (main.status === 'fulfilled' && main.value !== null) counts[site.platform] = main.value;
  else if (main.status === 'rejected') console.error('[dados] seguidores', main.reason);
  if (subscribers.status === 'fulfilled' && subscribers.value !== null) counts.youtube = subscribers.value;
  else if (subscribers.status === 'rejected') console.error('[dados] youtube', subscribers.reason);
  return counts;
}

/** Membros do Discord pela API pública de convites (with_counts=true). */
export async function getDiscord(): Promise<DiscordInfo> {
  const url = site.socials.find((s) => s.id === 'discord')?.url ?? `https://discord.gg/${site.discord.invite}`;
  const fallback: DiscordInfo = { members: site.discord.members, url };
  if (!site.discord.invite) return fallback;
  try {
    const res = await fetch(
      `https://discord.com/api/v10/invites/${encodeURIComponent(site.discord.invite)}?with_counts=true`,
      { next: { revalidate: 3_600 } },
    );
    if (!res.ok) return fallback;
    const data = (await res.json()) as { approximate_member_count?: number };
    return { members: data.approximate_member_count ?? fallback.members, url };
  } catch (error) {
    console.error('[dados] discord', error);
    return fallback;
  }
}
