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
  /** A versão inglesa (em /en). O que ficar em branco aparece em português. */
  en?: Partial<Pick<Gear, 'label' | 'note' | 'tags'>>;
};

export type Spec = {
  label: string;
  value: string;
  /** A versão inglesa (em /en). Em branco, aparece em português. */
  en?: Partial<Pick<Spec, 'label'>>;
};

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
  /**
   * Link curto: o-site/<slug> leva à marca e conta o clique (ver app/[slug]/route.ts).
   * Sem isto, sai do nome ("GTZ Esports" dá "gtz-esports").
   */
  slug?: string;
  /** A versão inglesa dos textos (em /en). O que ficar em branco aparece em português. */
  en?: Partial<Pick<Brand, 'category' | 'perk' | 'about' | 'perks' | 'cta' | 'note'>>;
};

/** Um giveaway: um cartão na secção dos giveaways, com o prémio e como participar. */
export type Giveaway = {
  /** O prémio, em poucas palavras: "Teclado Keychron Q1 Pro". */
  title: string;
  /** Uma ou duas frases: o que é, para quem, quando sai o vencedor. */
  about: string;
  /** Como participar, passo a passo. */
  steps: string[];
  /** Onde se participa (o formulário, o tweet, o Discord…). Sem link, o cartão fica sem botão. */
  url?: string;
  /** Texto do botão: "Participar". */
  cta: string;
  /** Imagem do prémio, em /public ou carregada no painel. */
  image?: string;
  /** Tamanho real da imagem (px). */
  imageSize?: { width: number; height: number };
  /**
   * Último dia para participar (AAAA-MM-DD, pelo relógio de Lisboa). No dia seguinte o cartão
   * sai do site sozinho. Sem data, fica até ser tirado.
   */
  endsAt?: string;
  /** A versão inglesa dos textos (em /en). O que ficar em branco aparece em português. */
  en?: Partial<Pick<Giveaway, 'title' | 'about' | 'steps' | 'cta'>>;
};

/** Uma regra do regulamento dos giveaways (/regulamento): um título curto e o que ela diz. */
export type Rule = {
  title: string;
  text: string;
  /** A versão inglesa (em /en/rules). Em branco, aparece em português. */
  en?: Partial<Pick<Rule, 'title' | 'text'>>;
};

/** Quem ganhou um giveaway que já acabou. Só o nome de utilizador, e só com o acordo da pessoa. */
export type Winner = {
  name: string;
  /** O que ganhou. */
  prize: string;
  /** O dia em que saiu (AAAA-MM-DD). */
  date?: string;
  /** A versão inglesa (em /en/rules). Em branco, aparece em português. */
  en?: Partial<Pick<Winner, 'prize'>>;
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
    /** A mesma arte em pequeno e quadrada, para a fotografia redonda da página de links (feita por scripts/icons.mjs). Sem ela, usa-se `photo`. */
    avatar?: string;
    /**
     * Com 'cover': a mesma arte num vídeo curto, sem som, que começa e acaba no fotograma da imagem
     * (para repetir sem salto). Toca em loop por cima da imagem, que fica como reserva.
     */
    photoVideo?: string;
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
  /**
   * Giveaways: a secção só aparece com `active` ligado e pelo menos um giveaway por terminar.
   * O link no menu aparece e desaparece com ela.
   */
  giveaways: {
    title: Title;
    intro: string;
    active: boolean;
    items: Giveaway[];
    /** O regulamento (/regulamento), regra a regra. Vale para todos os giveaways. */
    rules: Rule[];
    /** Quem já ganhou, do mais recente para o mais antigo. */
    winners: Winner[];
  };
  socialsSection: { title: Title; note: string };
  /**
   * Páginas que se podem tirar do site sem as apagar. Com false, a página dá "não encontrado",
   * saem os links para ela (rodapé, cartões dos giveaways, outras páginas) e sai do sitemap.
   * O que está escrito no painel fica guardado, e a página continua a ver-se na pré-visualização
   * (/admin/ver/links, /admin/ver/regulamento), para a rever antes de a pôr de volta.
   */
  pages: {
    /** A página de links (/links). Não tem link no site: é para pôr na bio das redes. */
    links: boolean;
    /** O regulamento dos giveaways, com os vencedores (/regulamento). */
    rules: boolean;
  };
  /**
   * Manutenção: com `active` ligado, a página inicial mostra só o aviso (`title`), ao centro do ecrã.
   * O painel (/admin) continua a funcionar: é lá, em Definições, que se liga e desliga.
   */
  maintenance: {
    active: boolean;
    title: Title;
    /**
     * Quando o site abre sozinho: um instante em ISO ("2026-10-13T16:10:00.000Z"), marcado no painel.
     * Até lá, o aviso é a página de abertura, com uma contagem decrescente; a essa hora a
     * manutenção acaba sem ninguém mexer (ver lib/content/opening.ts).
     */
    opensAt?: string;
    /** O que a página de abertura diz enquanto conta. */
    opening: { title: Title; text: string };
  };
};

/**
 * Os textos do site em inglês, para /en: os mesmos campos de `SiteConfig` que são texto (ver
 * content/site.en.ts). O que se escreve no painel tem a versão inglesa em cada item (`en`).
 */
export type SiteText = {
  role: string;
  tagline: string;
  description: string;
  hero: Pick<SiteConfig['hero'], 'greeting' | 'photoAlt' | 'note' | 'ribbon'>;
  clips: Pick<SiteConfig['clips'], 'title' | 'intro'>;
  setup: Pick<SiteConfig['setup'], 'title' | 'intro' | 'funStats'>;
  partners: Pick<SiteConfig['partners'], 'title' | 'intro' | 'stats' | 'mailSubject'>;
  giveaways: Pick<SiteConfig['giveaways'], 'title' | 'intro'>;
  maintenance: Pick<SiteConfig['maintenance'], 'title' | 'opening'>;
  socialsSection: SiteConfig['socialsSection'];
};

/**
 * A parte do site que se muda no painel (/admin), sem mexer no código: as redes, os periféricos,
 * o PC, as marcas das parcerias, os giveaways (com o regulamento e os vencedores) e o interruptor da manutenção. O resto (nome, handle, cores, imagem do hero e todos os textos
 * e títulos) vem só de `content/site.config.ts`.
 * O que o painel guarda substitui estes campos; enquanto não houver nada guardado, valem os da configuração.
 */
export type EditableContent = Pick<SiteConfig, 'socials' | 'discord'> & {
  setup: Pick<SiteConfig['setup'], 'gear' | 'pc'>;
  partners: Pick<SiteConfig['partners'], 'brands'>;
  giveaways: Pick<SiteConfig['giveaways'], 'active' | 'items' | 'rules' | 'winners'>;
  maintenance: Pick<SiteConfig['maintenance'], 'active' | 'opensAt'>;
};
