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

/** Uma parceria: um cartão na fila e, ao clicar, o cartão aberto com os detalhes. */
export type Brand = {
  name: string;
  /** O que a marca é, em duas ou três palavras. */
  category: string;
  /** A vantagem principal, em poucas palavras: aparece no cartão da fila. */
  perk: string;
  /** Uma ou duas frases sobre a marca, no cartão aberto. */
  about: string;
  /** Vantagens de usar o código ou o link. Só o que a marca confirma: nada de números inventados. */
  perks: string[];
  /** O código dela, se houver. */
  code?: string;
  /** true se o `url` já leva o código; senão, é para colar no checkout (e fica copiado ao abrir o site). */
  codeInLink?: boolean;
  /** Para onde vai o botão (de preferência o link de afiliada, já com o código). */
  url: string;
  /** Texto do botão: "Ir para a loja GTZ". */
  cta: string;
  /** Imagem da parceria (o banner da marca), em /public/partners. */
  image: string;
  /** Tamanho real da imagem (px). */
  imageSize: { width: number; height: number };
  /** Miniatura do cartão da fila, se a imagem não servir cortada em quadrado. */
  thumb?: string;
  /** O ponto da imagem que fica à vista quando é cortada (object-position). */
  focus?: string;
  /** Cor de fundo da imagem: vê-se atrás dela enquanto carrega ou quando não enche o espaço. */
  color: string;
  /** Aviso em letra pequena: idade mínima, risco, países onde não funciona. */
  note?: string;
};

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
    /**
     * Com 'cover': a continuação da imagem para a direita, bem desfocada (a imagem, o seu espelho e
     * a imagem outra vez, lado a lado). Com a televisão ligada, enche a moldura por trás dela.
     */
    photoBackdrop?: string;
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

/**
 * A parte do site que se muda no painel (/admin), sem mexer no código: textos, redes, setup e
 * parcerias. O resto (nome, handle, cores, imagem do hero) vem só de `content/site.config.ts`.
 * O que o painel guarda substitui estes campos; enquanto não houver nada guardado, valem os da configuração.
 */
export type EditableContent = Pick<SiteConfig, 'role' | 'tagline' | 'email' | 'socials' | 'discord' | 'setup' | 'partners' | 'socialsSection'> & {
  hero: Pick<SiteConfig['hero'], 'greeting' | 'note' | 'ribbon'>;
  clips: Pick<SiteConfig['clips'], 'title' | 'intro' | 'moreUrl' | 'recentDays'>;
};
