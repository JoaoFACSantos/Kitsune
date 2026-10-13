import type { EditableContent, GearIcon, SiteConfig, SocialId } from '@/content/types';

// O conteúdo que o painel edita: como se tira da configuração e como volta a entrar nela.
// Sem dependências do servidor: o painel (no browser) também usa isto.

/** Os campos editáveis, tirados de uma configuração completa. */
export function pickEditable(site: SiteConfig): EditableContent {
  return {
    socials: site.socials,
    discord: site.discord,
    setup: { gear: site.setup.gear, pc: site.setup.pc },
    partners: { brands: site.partners.brands },
    giveaways: { active: site.giveaways.active, items: site.giveaways.items, rules: site.giveaways.rules, winners: site.giveaways.winners },
    maintenance: { active: site.maintenance.active },
  };
}

/** A configuração com os campos editáveis trocados pelos do painel. */
export function applyContent(site: SiteConfig, content: EditableContent): SiteConfig {
  return {
    ...site,
    socials: content.socials,
    discord: content.discord,
    setup: { ...site.setup, ...content.setup },
    partners: { ...site.partners, ...content.partners },
    giveaways: { ...site.giveaways, ...content.giveaways },
    maintenance: { ...site.maintenance, ...content.maintenance },
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
  gear: 12,
  gearTags: 4,
  pc: 12,
  brands: 24,
  brandPerks: 6,
  giveaways: 6,
  giveawaySteps: 6,
  rules: 14,
  winners: 30,
} as const;

/** "GTZ Esports" → "gtz-esports": minúsculas, sem acentos, com hífenes no lugar do resto. */
export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
    .replace(/-+$/, '');

/** O link curto de uma parceria (o-site/<isto>): o que foi escrito no painel ou, sem isso, o nome. */
export const brandSlug = (brand: { slug?: string; name: string }) => slugify(brand.slug ?? '') || slugify(brand.name);

/** Um link curto bem formado: letras minúsculas, números e hífenes, de 2 a 24 caracteres. */
export const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,22}[a-z0-9])$/;

/** Endereços que já são do site (ou podem vir a ser): um link curto não lhes pode passar à frente. */
export const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'links',
  'regulamento',
  'privacidade',
  'uploads',
  'hero-video',
  'media',
  'partners',
  'icon',
  'apple-icon',
  'opengraph-image',
  'favicon',
  'robots',
  'sitemap',
  'marcas',
  'contacto',
  'horario',
  'sobre',
  'clips',
  'setup',
  'parcerias',
  'giveaways',
  'redes',
]);

/** Imagens que o conteúdo pode usar: as do projeto (/partners, /media) e as carregadas no painel (/uploads). */
export const IMAGE_PATH = /^\/(?:partners|media|uploads)\/[\w.-]{1,80}\.(?:jpe?g|png|webp|avif)$/;

/** Nome de um ficheiro carregado no painel: o início do hash do conteúdo, sempre em WebP. */
export const UPLOAD_NAME = /^[a-f0-9]{16}\.webp$/;
