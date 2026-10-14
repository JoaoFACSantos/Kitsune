// As línguas do site: o português, na raiz (/), e o inglês, em /en. As páginas são as mesmas
// (components/views) e recebem a língua. Os textos fixos dos componentes estão aqui; os do
// conteúdo estão em content/site.config.ts (português) e content/site.en.ts (inglês), e o que se
// escreve no painel tem a versão inglesa em cada item (ver lib/content/localize.ts).
// Sem dependências do servidor: os componentes do browser também usam isto.

export type Lang = 'pt' | 'en';

export const LANGS: readonly Lang[] = ['pt', 'en'];

/** O valor do atributo lang do <html>. */
export const HTML_LANG: Record<Lang, string> = { pt: 'pt-PT', en: 'en' };

/** O endereço é de uma página em inglês: /en, /en/… ou a pré-visualização delas (/admin/ver/en…). */
export function isEnglishPath(pathname: string) {
  const parts = pathname.split('/');
  return parts[1] === 'en' || (parts[1] === 'admin' && parts[2] === 'ver' && parts[3] === 'en');
}

/** Os endereços das páginas, numa língua. */
export type Routes = { home: string; links: string; privacy: string; rules: string };

/**
 * Os endereços das páginas na língua dada. `base` é para a pré-visualização do painel
 * (/admin/ver): as páginas ficam lá dentro, com a mesma forma.
 */
export function routesFor(lang: Lang, base = ''): Routes {
  const home = lang === 'en' ? `${base}/en` : base;
  return {
    home: home || '/',
    links: `${home}/links`,
    privacy: `${home}/${lang === 'en' ? 'privacy' : 'privacidade'}`,
    rules: `${home}/${lang === 'en' ? 'rules' : 'regulamento'}`,
  };
}

const pt = {
  switchLabel: 'Língua do site',
  langName: 'Português',
  nav: {
    main: 'Principal',
    home: (name: string) => `${name}, voltar ao início`,
    clips: 'Clips',
    setup: 'Setup',
    partners: 'Parcerias',
    giveaways: 'Giveaways',
    socials: 'Redes',
    openChannel: (platform: string) => `Abrir o canal na ${platform}`,
  },
  skip: 'Saltar para o conteúdo',
  darkMode: 'Modo escuro',
  // `short`: a etiqueta pequena do menu, onde cada píxel conta.
  live: { on: 'Em direto', short: 'Direto', off: 'Offline' },
  hero: {
    watchTitle: (title: string) => `Ver o direto: ${title}`,
    hearts: 'corações',
    sendHeart: (name: string) => `Mandar um coração à ${name}`,
    clickPhoto: ['clica na foto', 'para mandar ♡'],
    dragStickers: ['arrasta os', 'stickers!'],
    tapPlay: 'toca no play para ver o direto',
    tapPhoto: 'toca na foto para mandar corações',
    watchLive: 'Ver em direto',
    watchOn: (platform: string) => `Ver na ${platform}`,
    partners: 'Parcerias',
  },
  tv: { close: 'Fechar o direto', title: (name: string) => `Direto de ${name}` },
  clips: { all: 'Ver todos os clips', list: 'Clips', duration: 'Duração: ', views: 'visualizações', open: 'Abrir clip', close: 'Fechar' },
  setup: {
    tabs: 'Setup',
    gear: 'Periféricos',
    pc: 'O PC',
    features: 'Características',
    machine: 'A máquina',
    funStats: 'Estatísticas muito científicas',
  },
  partners: {
    kicker: 'Parcerias',
    lead: 'Marcas com quem trabalho. Clica numa para ver as vantagens e o código.',
    brands: 'Marcas',
    sendEmail: 'Enviar email',
    copyEmail: 'Copiar email',
    copied: 'Copiado ♡',
    emailCopied: (email: string) => `${email} copiado ♡`,
    close: 'Fechar',
    code: 'Código',
    copy: 'Copiar',
    perks: 'Vantagens',
    codeInLink: 'O link já leva o código.',
    codeCopied: 'O código fica copiado: cola-o no checkout.',
    imageAlt: (name: string) => `Imagem da parceria com a ${name}`,
  },
  giveaways: {
    endsToday: 'termina hoje',
    endsTomorrow: 'termina amanhã',
    daysLeft: (days: number) => `faltam ${days} dias`,
    until: (day: string) => `até ${day}`,
    ongoing: 'a decorrer',
    howTo: 'Como participar',
    rules: 'Regulamento dos giveaways',
  },
  counts: { followers: 'seguidores', subscribers: 'subscritores', members: 'membros' },
  footer: { more: 'Mais páginas', privacy: 'Privacidade', rules: 'Regulamento dos giveaways', backToTop: 'Voltar ao topo' },
  links: { socials: 'Redes', visit: 'Visitar o site' },
  doc: { back: '← Voltar ao site', site: 'Site', reviewed: (when: string) => `Revisto em ${when}.` },
  rules: {
    title: 'regulamento dos *giveaways*',
    lead: (name: string) =>
      `As regras que valem para todos os giveaways da ${name}. O prémio, os passos para participar e o prazo estão no cartão de cada um.`,
    empty: 'O regulamento ainda não foi escrito.',
    winners: 'Quem já ganhou',
  },
  opening: {
    opens: (when: string) => `O site abre ${when}.`,
    today: 'hoje',
    tomorrow: 'amanhã',
    on: (day: string) => `a ${day}`,
    at: (day: string, time: string) => `${day} às ${time}`,
    wait: (platform: string) => `Enquanto esperas: ${platform}`,
    timer: 'Tempo que falta para o site abrir',
    busy: 'A abrir…',
    units: { days: 'dias', hours: 'horas', min: 'min', sec: 'seg' },
  },
  meta: {
    links: 'Links',
    linksDescription: (name: string) => `As redes da ${name}, num só sítio.`,
    privacy: 'Privacidade',
    privacyDescription: (name: string) => `O que o site da ${name} guarda sobre quem o visita, e o que não guarda.`,
    rules: 'Regulamento dos giveaways',
    rulesDescription: (name: string) => `As regras dos giveaways da ${name}: quem pode participar, como se escolhe quem ganha e como chega o prémio.`,
  },
};

export type Messages = typeof pt;

const en: Messages = {
  switchLabel: 'Site language',
  langName: 'English',
  nav: {
    main: 'Main',
    home: (name) => `${name}, back to top`,
    clips: 'Clips',
    setup: 'Setup',
    partners: 'Partners',
    giveaways: 'Giveaways',
    socials: 'Socials',
    openChannel: (platform) => `Open the channel on ${platform}`,
  },
  skip: 'Skip to content',
  darkMode: 'Dark mode',
  live: { on: 'Live', short: 'Live', off: 'Offline' },
  hero: {
    watchTitle: (title) => `Watch the stream: ${title}`,
    hearts: 'hearts',
    sendHeart: (name) => `Send ${name} a heart`,
    clickPhoto: ['click the photo', 'to send ♡'],
    dragStickers: ['drag the', 'stickers!'],
    tapPlay: 'tap play to watch the stream',
    tapPhoto: 'tap the photo to send hearts',
    watchLive: 'Watch live',
    watchOn: (platform) => `Watch on ${platform}`,
    partners: 'Partners',
  },
  tv: { close: 'Close the stream', title: (name) => `${name}'s stream` },
  clips: { all: 'See all clips', list: 'Clips', duration: 'Duration: ', views: 'views', open: 'Open clip', close: 'Close' },
  setup: {
    tabs: 'Setup',
    gear: 'Gear',
    pc: 'The PC',
    features: 'Features',
    machine: 'The machine',
    funStats: 'Very scientific stats',
  },
  partners: {
    kicker: 'Partners',
    lead: 'Brands I work with. Click one to see the perks and the code.',
    brands: 'Brands',
    sendEmail: 'Send an email',
    copyEmail: 'Copy email',
    copied: 'Copied ♡',
    emailCopied: (email) => `${email} copied ♡`,
    close: 'Close',
    code: 'Code',
    copy: 'Copy',
    perks: 'Perks',
    codeInLink: 'The link already includes the code.',
    codeCopied: 'The code gets copied: paste it at checkout.',
    imageAlt: (name) => `${name} partnership image`,
  },
  giveaways: {
    endsToday: 'ends today',
    endsTomorrow: 'ends tomorrow',
    daysLeft: (days) => `${days} days left`,
    until: (day) => `until ${day}`,
    ongoing: 'open now',
    howTo: 'How to enter',
    rules: 'Giveaway rules',
  },
  counts: { followers: 'followers', subscribers: 'subscribers', members: 'members' },
  footer: { more: 'More pages', privacy: 'Privacy', rules: 'Giveaway rules', backToTop: 'Back to top' },
  links: { socials: 'Socials', visit: 'Visit the site' },
  doc: { back: '← Back to the site', site: 'Site', reviewed: (when) => `Last reviewed ${when}.` },
  rules: {
    title: 'giveaway *rules*',
    lead: (name) => `The rules for all of ${name}'s giveaways. The prize, how to enter and the deadline are on each giveaway's card.`,
    empty: "The rules haven't been written yet.",
    winners: 'Past winners',
  },
  opening: {
    opens: (when) => `The site opens ${when}.`,
    today: 'today',
    tomorrow: 'tomorrow',
    on: (day) => `on ${day}`,
    at: (day, time) => `${day} at ${time} (Lisbon time)`,
    wait: (platform) => `While you wait: ${platform}`,
    timer: 'Time left until the site opens',
    busy: 'Opening…',
    units: { days: 'days', hours: 'hours', min: 'min', sec: 'sec' },
  },
  meta: {
    links: 'Links',
    linksDescription: (name) => `${name}'s socials, all in one place.`,
    privacy: 'Privacy',
    privacyDescription: (name) => `What ${name}'s site keeps about its visitors, and what it doesn't.`,
    rules: 'Giveaway rules',
    rulesDescription: (name) => `The rules of ${name}'s giveaways: who can enter, how winners are picked and how prizes are sent.`,
  },
};

export const MESSAGES: Record<Lang, Messages> = { pt, en };

/** Os textos fixos numa língua. Nos componentes do browser, usa-se useMessages (providers/Lang). */
export const messages = (lang: Lang) => MESSAGES[lang];
