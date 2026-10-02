import 'server-only';
import { site } from '@/content/site.config';
import type { LiveStatus, StreamSource } from './types';

// Dados mock: sem chaves no .env o site funciona logo.
// Por omissão está offline; MOCK_LIVE=true mostra o estado "em direto".

const AVERAGE_VIEWERS = 1_850;

export const mockSource: StreamSource = {
  async getLiveStatus(): Promise<LiveStatus> {
    if (process.env.MOCK_LIVE !== 'true') return { live: false };
    const bucket = Math.floor(Date.now() / 300_000);
    return {
      live: true,
      title: 'Cozy games e conversa com o chat',
      category: 'Just Chatting',
      viewers: Math.round(AVERAGE_VIEWERS * (1 + 0.15 * Math.sin(bucket / 3))),
      startedAt: new Date(Date.now() - 47 * 60_000).toISOString(),
    };
  },
  async getClips(limit) {
    return site.clips.items.slice(0, limit);
  },
  async getFollowers() {
    return null;
  },
};

