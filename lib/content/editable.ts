import type { EditableContent, GearIcon, SiteConfig, SocialId } from '@/content/types';

// O conteúdo que o painel edita: como se tira da configuração e como volta a entrar nela.
// Sem dependências do servidor: o painel (no browser) também usa isto.

/** Os campos editáveis, tirados de uma configuração completa. */
export function pickEditable(site: SiteConfig): EditableContent {
  return {
    role: site.role,
    tagline: site.tagline,
    email: site.email,
    hero: { greeting: site.hero.greeting, note: site.hero.note, ribbon: site.hero.ribbon },
    socials: site.socials,
    discord: site.discord,
    clips: { title: site.clips.title, intro: site.clips.intro, moreUrl: site.clips.moreUrl, recentDays: site.clips.recentDays },
    setup: site.setup,
    partners: site.partners,
    socialsSection: site.socialsSection,
  };
}

/** A configuração com os campos editáveis trocados pelos do painel. */
export function applyContent(site: SiteConfig, content: EditableContent): SiteConfig {
  return {
    ...site,
    role: content.role,
    tagline: content.tagline,
    email: content.email,
    hero: { ...site.hero, ...content.hero },
    socials: content.socials,
    discord: content.discord,
    clips: { ...site.clips, ...content.clips },
    setup: content.setup,
    partners: content.partners,
    socialsSection: content.socialsSection,
  };
}

export const SOCIAL_LABELS: Record<SocialId, string> = {
  twitch: 'Twitch',
  youtube: 'YouTube',
  kick: 'Kick',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  x: 'X',
  discord: 'Discord',
};

export const SOCIAL_IDS = Object.keys(SOCIAL_LABELS) as SocialId[];

export const GEAR_LABELS: Record<GearIcon, string> = {
  headset: 'Headset',
  mic: 'Microfone',
  keyboard: 'Teclado',
  mouse: 'Rato',
  monitor: 'Monitor',
  camera: 'Câmara',
  chair: 'Cadeira',
  light: 'Luz',
};

export const GEAR_ICONS = Object.keys(GEAR_LABELS) as GearIcon[];

/** Quantos itens cabem em cada lista (o painel e a validação usam os mesmos). */
export const MAX = {
  socials: SOCIAL_IDS.length,
  ribbon: 12,
  gear: 12,
  gearTags: 4,
  pc: 12,
  funStats: 8,
  partnerStats: 4,
  brands: 24,
  brandPerks: 6,
} as const;

/** Imagens que o conteúdo pode usar: as do projeto (/partners, /media) e as carregadas no painel (/uploads). */
export const IMAGE_PATH = /^\/(?:partners|media|uploads)\/[\w.-]{1,80}\.(?:jpe?g|png|webp|avif)$/;

/** Nome de um ficheiro carregado no painel: o início do hash do conteúdo, sempre em WebP. */
export const UPLOAD_NAME = /^[a-f0-9]{16}\.webp$/;
