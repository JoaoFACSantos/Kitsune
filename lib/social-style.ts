import type { SocialId } from '@/content/types';

// Como cada rede aparece nos cartões (a secção das redes e a página de links).

/** Cores das plataformas, escurecidas onde era preciso para texto branco com contraste AA. */
export const SOCIAL_COLORS: Record<SocialId, string> = {
  twitch: '#9146FF',
  youtube: '#E6002E',
  tiktok: '#111111',
  instagram: 'linear-gradient(135deg, #833AB4, #C13584 55%, #E1306C)',
  x: '#111111',
  discord: '#5865F2',
  kick: '#1B7A2B',
};

/** Como cada rede chama a quem a segue (por omissão, "seguidores"). */
export const COUNT_LABEL: Partial<Record<SocialId, string>> = { discord: 'membros', youtube: 'subscritores' };
