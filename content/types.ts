/**
 * Forma do ficheiro de conteúdo. Tudo o que muda de streamer para streamer
 * vive em `content/site.config.ts`; os componentes só leem isto.
 */

export type Platform = 'twitch' | 'youtube' | 'kick';

export type SocialId = 'twitch' | 'youtube' | 'kick' | 'tiktok' | 'instagram' | 'x' | 'discord';

export type Social = {
  id: SocialId;
  label: string;
  handle: string;
  url: string;
  /**
   * Seguidores, escritos à mão. Na Twitch e no YouTube, o número da API substitui este
   * quando as chaves estão no .env. No Discord, os membros vêm da API se houver convite.
   */
  followers?: number;
};

export type GearIcon = 'headset' | 'mic' | 'keyboard' | 'mouse' | 'monitor' | 'camera' | 'chair' | 'light';

export type Gear = {
  icon: GearIcon;
  /** Categoria: "Headset", "Microfone"… */
  label: string;
  name: string;
  /** Uma frase com personalidade. */
  note: string;
  tags?: string[];
  url?: string;
};

export type Spec = { label: string; value: string };

export type FunStat = { value: string; label: string };

export type Brand = { name: string; logo: string; url?: string };

/** Um clip (melhor momento). Com as chaves da Twitch vêm da API; sem elas, de `clips.items`. */
export type Clip = {
  id: string;
  title: string;
  /** Página do clip na plataforma. */
  url: string;
  /** Player para ver sem sair do site. Sem isto, o cartão abre o `url`. */
  embedUrl?: string;
  /** Miniatura 16:9. Sem miniatura, o cartão mostra uma capa desenhada. */
  thumbnail?: string;
  views: number;
  /** Duração em segundos. */
  duration: number;
  /** Data ISO. */
  createdAt: string;
};

export type Theme = {
  /** Rosa principal (decorativo e texto grande). */
  pink: string;
  /** Rosa escuro para botões e texto pequeno (contraste AA). */
  pinkDeep: string;
  lilac: string;
  butter: string;
  mint: string;
  peach: string;
  /** Cor do texto. */
  ink: string;
  /** Fundo. */
  bg: string;
  /** Tema escuro (switch no nav): fundo e texto. */
  darkBg: string;
  darkInk: string;
};

/**
 * Títulos aceitam uma palavra de destaque entre asteriscos:
 * "o meu *setup*" mostra "setup" na letra manuscrita.
 */
export type Title = string;

export type SiteConfig = {
  name: string;
  /** Handle na plataforma principal, sem @. */
  handle: string;
  platform: Platform;
  role: string;
  tagline: string;
  email: string;
  url: string;
  description: string;
  theme: Theme;
  hero: {
    greeting: string;
    /** PNG recortado (fundo transparente) ou SVG. A cabeça sai da moldura. */
    photo: string;
    /** Imagem enquanto o direto passa na televisão (as personagens viradas para ela). Opcional. */
    photoWatching?: string;
    photoAlt: string;
    /** Tamanho real da imagem (px), para reservar o espaço certo. */
    photoSize: { width: number; height: number };
    /**
     * 'popout' (por omissão): recorte sem fundo, com a cabeça a sair por cima da moldura.
     * 'cover': imagem com fundo, a encher a moldura.
     */
    photoFit?: 'popout' | 'cover';
    /** Com 'cover': o ponto da imagem que fica à vista quando é cortada (object-position). */
    photoFocus?: string;
    /** Com 'popout': largura relativa à moldura e deslocamento vertical. */
    photoScale: number;
    photoOffsetY: number;
    /** Frase manuscrita no canto da moldura. */
    note: string;
    /** Palavras da fita que passa entre o hero e o setup. */
    ribbon: string[];
  };
  socials: Social[];
  /** invite: código do convite (discord.gg/<código>); vazio usa `members`. */
  discord: { invite: string; members: number };
  clips: {
    title: Title;
    intro: string;
    /** Página com todos os clips. */
    moreUrl: string;
    /**
     * Com as chaves da API: mostra os clips mais vistos dos últimos N dias.
     * Se o canal tiver poucos nesse período, passa para o último ano e depois para desde sempre.
     */
    recentDays: number;
    /** Clips de exemplo, usados sem chaves da API (ou se a API falhar). */
    items: Clip[];
  };
  setup: {
    title: Title;
    intro: string;
    gear: Gear[];
    pc: Spec[];
    funStats: FunStat[];
  };
  partners: {
    title: Title;
    intro: string;
    stats: FunStat[];
    brands: Brand[];
    mailSubject: string;
  };
  socialsSection: { title: Title; note: string };
};
