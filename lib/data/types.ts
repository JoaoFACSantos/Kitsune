import type { Clip } from '@/content/types';

export type LiveStatus =
  | {
      live: true;
      title: string;
      category: string;
      viewers: number;
      /** Data ISO de início. */
      startedAt: string;
      /** Imagem atual do direto (16:9), para a moldura do hero. */
      thumbnail?: string;
    }
  | { live: false };

/**
 * Fonte de dados de uma plataforma de streaming. A UI só conhece esta
 * interface: para ligar YouTube ou Kick, basta um novo adaptador.
 */
export interface StreamSource {
  getLiveStatus(): Promise<LiveStatus>;
  /** Os clips mais vistos do canal, de preferência dos últimos `recentDays` dias (`clips.recentDays`). */
  getClips(limit: number, recentDays: number): Promise<Clip[]>;
  /** Seguidores do canal, ou null se a fonte não souber. */
  getFollowers(): Promise<number | null>;
}

export type DiscordInfo = { members: number; url: string };
