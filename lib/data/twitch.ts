import 'server-only';
import { site } from '@/content/site.config';
import type { Clip } from '@/content/types';
import type { LiveStatus, StreamSource } from './types';

// Adaptador Twitch Helix, no servidor, com app access token (client credentials).
// Estado do direto com cache de 60 s; clips com cache de 1 h.

const HELIX = 'https://api.twitch.tv/helix';
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const HOUR_S = 3_600;

type Token = { value: string; expires: number };
let token: Token | null = null;
// Pedido de token em curso, partilhado por chamadas em paralelo.
let pending: Promise<string> | null = null;

function credentials() {
  const id = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secret) throw new Error('Faltam TWITCH_CLIENT_ID e TWITCH_CLIENT_SECRET');
  return { id, secret };
}

async function requestToken() {
  const { id, secret } = credentials();
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: 'client_credentials' }),
    // Em cache 1 h (o token dura semanas). Com 'no-store', a página deixava de poder ser
    // estática e os dados da Twitch falhavam em produção.
    cache: 'force-cache',
    next: { revalidate: HOUR_S },
  });
  if (!res.ok) throw new Error(`Twitch token: ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return token.value;
}

async function appToken(force = false) {
  if (!force && token && token.expires > Date.now() + MINUTE) return token.value;
  pending ??= requestToken().finally(() => {
    pending = null;
  });
  return pending;
}

async function helix<T>(path: string, revalidate: number): Promise<T> {
  const request = async (force: boolean) =>
    fetch(`${HELIX}${path}`, {
      headers: { 'Client-Id': credentials().id, Authorization: `Bearer ${await appToken(force)}` },
      next: { revalidate, tags: ['twitch'] },
    });
  let res = await request(false);
  if (res.status === 401) res = await request(true); // token expirado ou revogado
  if (!res.ok) throw new Error(`Twitch ${path.split('?')[0]}: ${res.status}`);
  return (await res.json()) as T;
}

type HelixStream = {
  type: string;
  title: string;
  game_name: string;
  viewer_count: number;
  started_at: string;
  /** Com {width} e {height} por preencher. */
  thumbnail_url: string;
};
type HelixUser = { id: string };
type HelixClip = {
  id: string;
  url: string;
  embed_url: string;
  title: string;
  view_count: number;
  created_at: string;
  thumbnail_url: string;
  duration: number;
};

/** ID do canal a partir do handle (muda raramente: cache de 1 dia). */
async function broadcasterId() {
  const users = await helix<{ data: HelixUser[] }>(`/users?login=${encodeURIComponent(site.handle)}`, 24 * HOUR_S);
  return users.data[0]?.id ?? null;
}

/** Os clips mais vistos do canal nos últimos `days` dias (null: desde sempre). */
async function topClips(id: string, days: number | null) {
  const query = new URLSearchParams({ broadcaster_id: id, first: '100' });
  if (days !== null) {
    // O período acaba à meia-noite (UTC) de hoje e não "agora": o URL fica igual o dia todo
    // e a cache de 1 h funciona. Sem `ended_at`, a Twitch só olha para uma semana.
    const end = Math.ceil(Date.now() / DAY) * DAY;
    query.set('started_at', new Date(end - days * DAY).toISOString());
    query.set('ended_at', new Date(end).toISOString());
  }
  const { data } = await helix<{ data: HelixClip[] }>(`/clips?${query}`, HOUR_S);
  // Pedem-se 100 e ordena-se aqui, para não depender da ordem em que a Twitch os devolve.
  return data.sort((a, b) => b.view_count - a.view_count);
}

export const twitchSource: StreamSource = {
  async getLiveStatus(): Promise<LiveStatus> {
    const { data } = await helix<{ data: HelixStream[] }>(`/streams?user_login=${encodeURIComponent(site.handle)}`, 60);
    const stream = data[0];
    if (!stream || stream.type !== 'live') return { live: false };
    return {
      live: true,
      title: stream.title,
      category: stream.game_name,
      viewers: stream.viewer_count,
      startedAt: stream.started_at,
      thumbnail: stream.thumbnail_url.replace('{width}', '1280').replace('{height}', '720'),
    };
  },
  async getClips(limit, recentDays): Promise<Clip[]> {
    const id = await broadcasterId();
    if (!id) return [];
    // Os mais vistos dos últimos dias. Se o canal tiver poucos clips nesse período,
    // alarga-se para o último ano e, por fim, para desde sempre.
    let clips: HelixClip[] = [];
    for (const days of [recentDays, 365, null]) {
      clips = await topClips(id, days);
      if (clips.length >= limit) break;
    }
    return clips.slice(0, limit).map((clip) => ({
      id: clip.id,
      title: clip.title,
      url: clip.url,
      embedUrl: clip.embed_url,
      thumbnail: clip.thumbnail_url,
      views: clip.view_count,
      duration: clip.duration,
      createdAt: clip.created_at,
    }));
  },
  async getFollowers() {
    const id = await broadcasterId();
    if (!id) return null;
    // O total é público: chega o app token.
    const { total } = await helix<{ total: number }>(`/channels/followers?broadcaster_id=${id}&first=1`, HOUR_S);
    return total;
  },
};
