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
  // Email de exemplo: troca pelo verdadeiro.
  email: 'parcerias@kitsune.example',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
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
    // Ilustração: a Kitsune abraçada a uma raposa. Para usar uma foto: PNG com fundo transparente, recortada até à cintura.
    photo: '/media/kitsune.svg',
    photoAlt: 'Kitsune, de cabelo ruivo comprido, abraçada a uma raposa que pisca o olho',
    photoSize: { width: 600, height: 760 },
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
  ],

  // Só aparece se houver uma rede com id 'discord' em `socials`.
  discord: { invite: '', members: 12_480 },

  clips: {
    title: 'melhores *momentos*',
    intro: 'Os clips mais vistos do canal. Aviso: há muitos gritos.',
    moreUrl: 'https://www.twitch.tv/kitsune/clips',
    // Clips de exemplo. Com as chaves da Twitch no .env, vêm os mais vistos do canal.
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
      { value: '1,8 mil', label: 'média de pessoas a ver' },
      { value: '81%', label: 'audiência entre 18 e 34 anos' },
      { value: '72%', label: 'audiência em Portugal' },
    ],
    // Marcas fictícias de exemplo.
    brands: [
      { name: 'Volta', logo: '/brands/volta.svg' },
      { name: 'Kestrel', logo: '/brands/kestrel.svg' },
      { name: 'Maré Telecom', logo: '/brands/mare.svg' },
      { name: 'Órbita', logo: '/brands/orbita.svg' },
      { name: 'Pixel Norte', logo: '/brands/pixel-norte.svg' },
      { name: 'Cadência', logo: '/brands/cadencia.svg' },
    ],
    mailSubject: 'Parceria com a Kitsune',
  },

  socialsSection: { title: 'segue-me *aqui*', note: 'prometo que vale a pena' },
};
