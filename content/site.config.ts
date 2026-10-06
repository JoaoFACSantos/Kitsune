import type { SiteConfig } from './types';

/**
 * Todo o conteúdo do site. Para outra streamer, muda só este ficheiro
 * e os ficheiros em /public/media e /public/brands.
 */
export const site: SiteConfig = {
  name: 'Kitsune',
  handle: 'kitsune',
  platform: 'twitch',
  role: 'Streamer & criadora de conteúdo',
  tagline: 'Jogos, conversa e muitas gargalhadas, sempre com o chat.',
  email: 'kitsunepartnerships@gmail.com',
  url:
    // "||" e não "??": no .env a variável pode existir vazia (NEXT_PUBLIC_SITE_URL=).
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000'),
  description: 'Kitsune é streamer e criadora de conteúdo. Os clips, o setup, as parcerias e todas as redes num só sítio.',

  // Cores do tema: mudam o site todo.
  theme: {
    pink: '#FF4FA0',
    pinkDeep: '#D6106B',
    lilac: '#B9A4FF',
    butter: '#FFD66E',
    mint: '#8EE3C8',
    peach: '#FFB199',
    ink: '#2A0F2F',
    bg: '#FFF4F8',
    darkBg: '#140A18',
    darkInk: '#FBEAF3',
  },

  hero: {
    greeting: 'olá! eu sou a',
    // A arte dela, com fundo: enche a moldura ('cover'). Para um recorte sem fundo (PNG ou SVG, até à cintura),
    // usa photoFit: 'popout' e a cabeça sai por cima da moldura; /media/kitsune.svg é um desenho desses
    // (com "#watch" em photoWatching, as duas viram-se para a televisão).
    photo: '/media/kitsune.jpg',
    photoAlt: 'Kitsune, de cabelo ruivo comprido, encostada a uma raposa que pisca o olho',
    photoSize: { width: 1254, height: 1254 },
    photoFit: 'cover',
    // Mais para a esquerda, para a raposa caber inteira.
    photoFocus: '25% 50%',
    // A mesma arte a continuar para a direita, desfocada: é o fundo por trás da televisão.
    photoBackdrop: '/media/kitsune-wide.jpg',
    photoScale: 1.22,
    photoOffsetY: 0,
    note: 'espero-te na live!',
    ribbon: ['streamer', 'gamer', 'criadora de conteúdo', 'just chatting', 'cozy games', 'good vibes'],
  },

  // Seguidores, lidos nas páginas públicas a 2 de outubro de 2026.
  // Twitch e YouTube: com as chaves no .env, o número da API substitui o que está aqui.
  // Instagram, TikTok e X não dão o número sem login: atualiza `followers` à mão de vez em quando.
  socials: [
    { id: 'twitch', label: 'Twitch', handle: '@kitsune', url: 'https://www.twitch.tv/kitsune', followers: 76_100 },
    { id: 'tiktok', label: 'TikTok', handle: '@souakitsune', url: 'https://www.tiktok.com/@souakitsune', followers: 25_400 },
    { id: 'youtube', label: 'YouTube', handle: 'KitsuneYoutube', url: 'https://www.youtube.com/c/KitsuneYoutube', followers: 1_290 },
    { id: 'instagram', label: 'Instagram', handle: '@souakitsune', url: 'https://www.instagram.com/souakitsune/', followers: 25_000 },
    { id: 'x', label: 'X', handle: '@souakitsune', url: 'https://x.com/souakitsune', followers: 8_199 },
    { id: 'discord', label: 'Discord', handle: 'Kitsuniverse', url: 'https://discord.com/invite/4h8NcDu4YR' },
  ],

  // Só aparece se houver uma rede com id 'discord' em `socials`.
  // Os membros vêm da API pelo convite; `members` (lido a 6 de outubro de 2026) fica se a API falhar.
  discord: { invite: '4h8NcDu4YR', members: 1_448 },

  clips: {
    title: 'melhores *momentos*',
    intro: 'Os clips mais vistos do canal.',
    moreUrl: 'https://www.twitch.tv/kitsune/clips',
    // Com as chaves da Twitch no .env: os mais vistos dos últimos 30 dias.
    recentDays: 30,
    // Clips de exemplo, usados sem as chaves.
    items: [
      {
        id: 'clutch',
        title: 'O clutch 1v4 que ninguém esperava',
        url: 'https://www.twitch.tv/kitsune/clips',
        views: 318_400,
        duration: 28,
        createdAt: '2026-08-14',
      },
      {
        id: 'gato',
        title: 'O gato desligou o PC em direto',
        url: 'https://www.twitch.tv/kitsune/clips',
        views: 204_900,
        duration: 41,
        createdAt: '2026-06-02',
      },
      {
        id: 'susto',
        title: 'O maior susto de sempre num jogo de terror',
        url: 'https://www.twitch.tv/kitsune/clips',
        views: 152_300,
        duration: 19,
        createdAt: '2026-09-21',
      },
      {
        id: 'raid',
        title: 'Raid surpresa de 3 mil pessoas',
        url: 'https://www.twitch.tv/kitsune/clips',
        views: 97_600,
        duration: 52,
        createdAt: '2026-04-27',
      },
    ],
  },

  setup: {
    title: 'o meu *setup*',
    intro: 'Tudo o que uso para jogar, conversar e fazer asneiras em direto.',
    gear: [
      {
        icon: 'headset',
        label: 'Headset',
        name: 'Razer Kraken Kitty V2 Pro',
        note: 'Orelhas de gato com RGB, obviamente.',
        tags: ['Sem fios', 'RGB'],
      },
      {
        icon: 'mic',
        label: 'Microfone',
        name: 'Shure MV7+',
        note: 'O chat diz que se ouve tudo. Até o gato.',
        tags: ['USB-C', 'XLR'],
      },
      {
        icon: 'keyboard',
        label: 'Teclado',
        name: 'Keychron Q1 Pro',
        note: 'Teclas cor-de-rosa e switches silenciosos.',
        tags: ['75%', 'Hot-swap'],
      },
      {
        icon: 'mouse',
        label: 'Rato',
        name: 'Logitech G Pro X Superlight 2',
        note: 'Leve, branco e sempre impecável.',
        tags: ['60 g', 'Sem fios'],
      },
      {
        icon: 'monitor',
        label: 'Monitor',
        name: 'ASUS ROG Swift OLED 27"',
        note: '240 Hz para não haver desculpas.',
        tags: ['OLED', '240 Hz'],
      },
      {
        icon: 'camera',
        label: 'Câmara',
        name: 'Sony ZV-E10 + Sigma 16 mm',
        note: 'A razão de a imagem ser tão bonita.',
        tags: ['4K', 'f/1.4'],
      },
      {
        icon: 'chair',
        label: 'Cadeira',
        name: 'Secretlab Titan Evo',
        note: 'Horas de direto sem dores nas costas.',
        tags: ['Rosa', 'Ergonómica'],
      },
      {
        icon: 'light',
        label: 'Luz',
        name: 'Elgato Key Light Air ×2',
        note: 'Luz suave e zero sombras.',
        tags: ['Wi-Fi', '1400 lm'],
      },
    ],
    pc: [
      { label: 'Processador', value: 'AMD Ryzen 7 7800X3D' },
      { label: 'Placa gráfica', value: 'NVIDIA RTX 4070 Ti Super' },
      { label: 'Memória', value: '32 GB DDR5 6000 MHz' },
      { label: 'Armazenamento', value: '2 TB NVMe Gen4' },
      { label: 'Motherboard', value: 'ASUS ROG Strix B650-A' },
      { label: 'Refrigeração', value: 'NZXT Kraken 240 RGB' },
      { label: 'Fonte', value: 'Corsair RM850x' },
      { label: 'Caixa', value: 'Lian Li O11 Dynamic Mini' },
    ],
    funStats: [
      { value: '240+', label: 'FPS nos competitivos' },
      { value: '2', label: 'cafés por direto' },
      { value: '47', label: 'separadores abertos' },
      { value: '∞', label: 'vezes que disse "último jogo"' },
    ],
  },

  partners: {
    title: 'vamos criar algo *juntos*?',
    intro:
      'Integrações em direto, vídeos dedicados e campanhas nas redes, sempre com um relatório no fim. Respondo em 48 horas.',
    stats: [
      // Soma de `followers` em `socials`, arredondada para baixo. Escrita à mão: atualiza quando passar outro marco.
      { value: '+100 mil', label: 'seguidores em todas as plataformas' },
      { value: '81%', label: 'audiência entre 18 e 34 anos' },
      { value: '72%', label: 'audiência em Portugal' },
    ],
    // As parcerias dos painéis da Twitch dela (e do título dos diretos), lidas a 6 de outubro de 2026.
    // As vantagens são só as que a marca anuncia nos banners: confirma-as com ela antes de mexer.
    brands: [
      {
        name: 'GTZ Esports',
        category: 'Esports · merch oficial',
        perk: '10% de desconto',
        about:
          'Organização portuguesa de esports. Na loja oficial há jerseys, hoodies e drops exclusivos da equipa, e também uma caneca da Kitsune.',
        perks: [
          '10% de desconto na loja oficial com o código KITSUNE10',
          'Jerseys, hoodies e merch oficial da equipa',
          'Caneca oficial GTZ da Kitsune',
        ],
        code: 'KITSUNE10',
        url: 'https://gtz.pt/shop/merch',
        cta: 'Ir para a loja GTZ',
        image: '/partners/gtz.jpg',
        imageSize: { width: 320, height: 430 },
        focus: '50% 18%',
        color: '#0b0b0b',
      },
      {
        name: 'Zumub',
        category: 'Nutrição desportiva',
        perk: 'código KITSUNE',
        about: 'Loja online de suplementos, proteínas e vitaminas, com envio para todo o país.',
        perks: ['Usa o código KITSUNE no carrinho, antes de pagar'],
        code: 'KITSUNE',
        url: 'https://www.zumub.com/PT/',
        cta: 'Ir para a Zumub',
        image: '/partners/zumub.jpg',
        imageSize: { width: 1200, height: 628 },
        thumb: '/partners/zumub-mark.jpg',
        color: '#000000',
      },
      {
        name: 'PirateSwap',
        category: 'Skins de CS2',
        perk: '+35% de bónus',
        about: 'Plataforma para trocar ou vender skins de CS2 na hora.',
        perks: ['+35% de bónus ao carregar saldo com o código KITSUNE', 'O link já leva o código'],
        code: 'KITSUNE',
        codeInLink: true,
        url: 'https://pirateswap.com/?ref=kitsune',
        cta: 'Ir para a PirateSwap',
        image: '/partners/pirateswap.jpg',
        imageSize: { width: 320, height: 574 },
        focus: '50% 0%',
        color: '#4a1fb8',
      },
      {
        name: 'CSGO-Skins',
        category: 'Caixas de skins de CS2',
        perk: 'código KITSUNE',
        about: 'Site de abertura de caixas de skins de CS2.',
        perks: ['Regista-te pelo link: o código KITSUNE já vai aplicado'],
        code: 'KITSUNE',
        codeInLink: true,
        url: 'https://csgo-skins.com/?ref=KITSUNE',
        cta: 'Ir para a CSGO-Skins',
        image: '/partners/csgoskins.jpg',
        imageSize: { width: 320, height: 600 },
        focus: '50% 14%',
        color: '#101c4a',
        note: 'Abrir caixas envolve dinheiro real: joga com responsabilidade.',
      },
      {
        name: 'BingX',
        category: 'Criptomoedas',
        perk: 'bónus de boas-vindas',
        about: 'Plataforma de trading de criptomoedas.',
        perks: [
          'Bónus de boas-vindas para novos registos pelo link (o valor é definido pela BingX)',
          'O link já leva o código de convite',
        ],
        code: 'Kitsune',
        codeInLink: true,
        url: 'https://bingxdao.com/partner/Kitsune/',
        cta: 'Ir para a BingX',
        image: '/partners/bingx.jpg',
        imageSize: { width: 320, height: 536 },
        focus: '50% 100%',
        color: '#16171c',
        note: 'Os criptoativos são de alto risco: podes perder tudo o que investires. A BingX não aceita registos de alguns países; em outubro de 2026, Portugal era um deles.',
      },
      {
        name: 'Beyond Industries',
        category: 'Estúdio criativo',
        perk: 'produção e design',
        about: 'Estúdio de produção, edição e design vocacionado para a criação de conteúdo digital.',
        perks: [],
        url: 'https://www.instagram.com/afonso.gvg.rosa/',
        cta: 'Ver no Instagram',
        image: '/partners/beyond.jpg',
        imageSize: { width: 320, height: 400 },
        focus: '50% 100%',
        color: '#a000f0',
      },
    ],
    mailSubject: 'Parceria com a Kitsune',
  },

  socialsSection: { title: 'segue-me *aqui*', note: 'prometo que vale a pena' },
};
