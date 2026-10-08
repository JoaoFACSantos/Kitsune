import type { Brand, EditableContent, FunStat, Gear, GearIcon, Social, SocialId, Spec } from '@/content/types';
import { GEAR_ICONS, IMAGE_PATH, MAX, SOCIAL_IDS, SOCIAL_LABELS } from './editable';

// Validação do conteúdo do painel. Tudo o que chega do browser passa por aqui antes de ser
// guardado, e o que se lê do disco também: o resultado tem sempre a forma certa, com os textos
// limpos, só links http(s) e só imagens do próprio site. Os problemas ficam numa lista, com o
// caminho do campo ("partners.brands.2.url"), para o painel os mostrar no sítio.

export type Issue = { path: string; message: string };

type Bag = Issue[];
type Rec = Record<string, unknown>;

const isRecord = (value: unknown): value is Rec => typeof value === 'object' && value !== null && !Array.isArray(value);
const record = (value: unknown): Rec => (isRecord(value) ? value : {});

/** Uma linha de texto: sem quebras nem caracteres de controlo, sem espaços a mais e dentro do tamanho. */
function text(bag: Bag, value: unknown, path: string, max: number, required = true): string {
  const raw = typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
  const clean = raw
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean && required) bag.push({ path, message: 'Falta preencher.' });
  if (clean.length > max) {
    bag.push({ path, message: `Máximo de ${max} caracteres (tem ${clean.length}).` });
    return clean.slice(0, max);
  }
  return clean;
}

/** Link completo, só http(s): um "javascript:" num href corria código no browser de quem clicasse. */
function link(bag: Bag, value: unknown, path: string, required = true): string {
  let raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) {
    if (required) bag.push({ path, message: 'Falta o link.' });
    return '';
  }
  // "gtz.pt/shop" escrito sem o início: assume-se https.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) raw = `https://${raw}`;
  let url: URL | null = null;
  try {
    url = new URL(raw);
  } catch {
    url = null;
  }
  if (!url || (url.protocol !== 'https:' && url.protocol !== 'http:') || !url.hostname.includes('.') || raw.length > 500) {
    bag.push({ path, message: 'Tem de ser um link completo, a começar por https://' });
    return '';
  }
  return url.href;
}

function int(bag: Bag, value: unknown, path: string, min: number, max: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : Number.NaN;
  if (!Number.isFinite(n)) {
    bag.push({ path, message: 'Tem de ser um número.' });
    return min;
  }
  const rounded = Math.round(n);
  if (rounded < min || rounded > max) {
    bag.push({ path, message: `Tem de estar entre ${min} e ${max}.` });
    return Math.min(max, Math.max(min, rounded));
  }
  return rounded;
}

function list<T>(bag: Bag, value: unknown, path: string, max: number, item: (entry: unknown, path: string) => T, min = 0): T[] {
  const items = Array.isArray(value) ? value : [];
  if (items.length > max) bag.push({ path, message: `No máximo ${max}.` });
  if (items.length < min) bag.push({ path, message: 'Tem de haver pelo menos um.' });
  return items.slice(0, max).map((entry, i) => item(entry, `${path}.${i}`));
}

/** Os componentes do site usam estes textos como chave das listas: repetidos baralhavam o React. */
function unique<T>(bag: Bag, items: T[], path: string, key: (item: T) => string, field: string) {
  const seen = new Set<string>();
  items.forEach((item, i) => {
    const k = key(item).toLowerCase();
    if (!k) return;
    if (seen.has(k)) bag.push({ path: field ? `${path}.${i}.${field}` : `${path}.${i}`, message: 'Está repetido: muda um deles.' });
    seen.add(k);
  });
}

function image(bag: Bag, value: unknown, path: string, required = true): string {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) {
    if (required) bag.push({ path, message: 'Falta a imagem.' });
    return '';
  }
  if (!IMAGE_PATH.test(raw)) {
    bag.push({ path, message: 'Imagem inválida: carrega-a outra vez.' });
    return '';
  }
  return raw;
}

const dimension = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? Math.min(20_000, Math.max(1, Math.round(value))) : 1);

const color = (value: unknown) => (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim().toLowerCase() : '#140a18');

/** "25% 50%" (object-position), ou nada. */
function position(value: unknown): string | undefined {
  const match = typeof value === 'string' ? /^(\d{1,3})% (\d{1,3})%$/.exec(value.trim()) : null;
  if (!match || Number(match[1]) > 100 || Number(match[2]) > 100) return undefined;
  return `${Number(match[1])}% ${Number(match[2])}%`;
}

function stat(bag: Bag, value: unknown, path: string): FunStat {
  const v = record(value);
  return { value: text(bag, v.value, `${path}.value`, 12), label: text(bag, v.label, `${path}.label`, 50) };
}

function spec(bag: Bag, value: unknown, path: string): Spec {
  const v = record(value);
  return { label: text(bag, v.label, `${path}.label`, 30), value: text(bag, v.value, `${path}.value`, 60) };
}

function social(bag: Bag, value: unknown, path: string): Social {
  const v = record(value);
  const id = SOCIAL_IDS.find((known) => known === v.id) ?? null;
  if (!id) bag.push({ path: `${path}.id`, message: 'Escolhe a rede.' });
  const empty = v.followers === undefined || v.followers === null || v.followers === '';
  const followers = empty ? undefined : int(bag, v.followers, `${path}.followers`, 0, 2_000_000_000);
  return {
    id: id ?? 'twitch',
    label: text(bag, v.label, `${path}.label`, 24, false) || SOCIAL_LABELS[id ?? 'twitch'],
    handle: text(bag, v.handle, `${path}.handle`, 40),
    url: link(bag, v.url, `${path}.url`),
    ...(followers === undefined ? {} : { followers }),
  };
}

function gear(bag: Bag, value: unknown, path: string): Gear {
  const v = record(value);
  const icon = GEAR_ICONS.find((known) => known === v.icon) ?? null;
  if (!icon) bag.push({ path: `${path}.icon`, message: 'Escolhe o ícone.' });
  const tags = list(bag, v.tags, `${path}.tags`, MAX.gearTags, (entry, p) => text(bag, entry, p, 20));
  unique(bag, tags, `${path}.tags`, (tag) => tag, '');
  const url = link(bag, v.url, `${path}.url`, false);
  return {
    icon: icon ?? ('headset' satisfies GearIcon),
    label: text(bag, v.label, `${path}.label`, 24),
    name: text(bag, v.name, `${path}.name`, 60),
    note: text(bag, v.note, `${path}.note`, 120, false),
    ...(tags.length ? { tags } : {}),
    ...(url ? { url } : {}),
  };
}

function brand(bag: Bag, value: unknown, path: string): Brand {
  const v = record(value);
  const size = record(v.imageSize);
  const code = text(bag, v.code, `${path}.code`, 24, false).replace(/\s+/g, '');
  const thumb = image(bag, v.thumb, `${path}.thumb`, false);
  const focus = position(v.focus);
  const note = text(bag, v.note, `${path}.note`, 300, false);
  const perks = list(bag, v.perks, `${path}.perks`, MAX.brandPerks, (entry, p) => text(bag, entry, p, 140));
  unique(bag, perks, `${path}.perks`, (perk) => perk, '');
  return {
    name: text(bag, v.name, `${path}.name`, 40),
    category: text(bag, v.category, `${path}.category`, 40),
    perk: text(bag, v.perk, `${path}.perk`, 32),
    about: text(bag, v.about, `${path}.about`, 400),
    perks,
    ...(code ? { code, ...(v.codeInLink === true ? { codeInLink: true } : {}) } : {}),
    url: link(bag, v.url, `${path}.url`),
    cta: text(bag, v.cta, `${path}.cta`, 40),
    image: image(bag, v.image, `${path}.image`),
    imageSize: { width: dimension(size.width), height: dimension(size.height) },
    ...(thumb ? { thumb } : {}),
    ...(focus ? { focus } : {}),
    color: color(v.color),
    ...(note ? { note } : {}),
  };
}

/** O código de um link de convite do Discord ("https://discord.gg/abc" → "abc"). */
const inviteCode = (url: string | undefined) => /(?:discord\.gg\/|discord(?:app)?\.com\/invite\/)([\w-]{2,40})/i.exec(url ?? '')?.[1];

/** Um código de convite escrito à mão (ou o link inteiro): fica só o código. */
function discordInvite(value: unknown): string {
  const raw = typeof value === 'string' ? value.trim() : '';
  const code = inviteCode(raw) ?? raw;
  return /^[\w-]{2,40}$/.test(code) ? code : '';
}

function email(bag: Bag, value: unknown, path: string): string {
  const clean = text(bag, value, path, 120);
  if (clean && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) bag.push({ path, message: 'Não parece um email.' });
  return clean;
}

/**
 * Devolve o conteúdo limpo e a lista de problemas (vazia se estiver tudo bem).
 * `base` é o conteúdo de origem: o que faltar em `input` vem de lá, para um ficheiro guardado
 * por uma versão mais antiga do site continuar a servir. `platform` é a rede principal do site.
 */
export function validateContent(input: unknown, base: EditableContent, platform: SocialId): { content: EditableContent; issues: Issue[] } {
  const bag: Bag = [];
  const src = record(input);
  const top = (key: keyof EditableContent): unknown => (src[key] === undefined ? base[key] : src[key]);
  const part = (key: keyof EditableContent): Rec => ({ ...(base[key] as object), ...record(src[key]) });

  const hero = part('hero');
  const discord = part('discord');
  const clips = part('clips');
  const setup = part('setup');
  const partners = part('partners');
  const socialsSection = part('socialsSection');

  const ribbon = list(bag, hero.ribbon, 'hero.ribbon', MAX.ribbon, (entry, p) => text(bag, entry, p, 30), 1);
  unique(bag, ribbon, 'hero.ribbon', (word) => word, '');

  const socials = list(bag, top('socials'), 'socials', MAX.socials, (entry, p) => social(bag, entry, p), 1);
  unique(bag, socials, 'socials', (s) => s.id, 'id');
  if (!socials.some((s) => s.id === platform)) {
    bag.push({ path: 'socials', message: `Falta a ${SOCIAL_LABELS[platform]}: é a rede principal, os botões do site apontam para ela.` });
  }

  const gearList = list(bag, setup.gear, 'setup.gear', MAX.gear, (entry, p) => gear(bag, entry, p), 1);
  unique(bag, gearList, 'setup.gear', (g) => g.name, 'name');
  const pc = list(bag, setup.pc, 'setup.pc', MAX.pc, (entry, p) => spec(bag, entry, p));
  unique(bag, pc, 'setup.pc', (s) => s.label, 'label');
  const funStats = list(bag, setup.funStats, 'setup.funStats', MAX.funStats, (entry, p) => stat(bag, entry, p));
  unique(bag, funStats, 'setup.funStats', (s) => s.label, 'label');

  const stats = list(bag, partners.stats, 'partners.stats', MAX.partnerStats, (entry, p) => stat(bag, entry, p));
  unique(bag, stats, 'partners.stats', (s) => s.label, 'label');
  const brands = list(bag, partners.brands, 'partners.brands', MAX.brands, (entry, p) => brand(bag, entry, p));
  unique(bag, brands, 'partners.brands', (b) => b.name, 'name');

  const content: EditableContent = {
    role: text(bag, top('role'), 'role', 60),
    tagline: text(bag, top('tagline'), 'tagline', 160),
    email: email(bag, top('email'), 'email'),
    hero: {
      greeting: text(bag, hero.greeting, 'hero.greeting', 40),
      note: text(bag, hero.note, 'hero.note', 40, false),
      ribbon,
    },
    socials,
    discord: {
      // O convite sai do link do Discord na lista de redes: é por ele que se contam os membros.
      invite: inviteCode(socials.find((s) => s.id === 'discord')?.url) ?? discordInvite(discord.invite),
      members: int(bag, discord.members, 'discord.members', 0, 100_000_000),
    },
    clips: {
      title: text(bag, clips.title, 'clips.title', 60),
      intro: text(bag, clips.intro, 'clips.intro', 200, false),
      moreUrl: link(bag, clips.moreUrl, 'clips.moreUrl'),
      recentDays: int(bag, clips.recentDays, 'clips.recentDays', 1, 3650),
    },
    setup: {
      title: text(bag, setup.title, 'setup.title', 60),
      intro: text(bag, setup.intro, 'setup.intro', 200, false),
      gear: gearList,
      pc,
      funStats,
    },
    partners: {
      title: text(bag, partners.title, 'partners.title', 60),
      intro: text(bag, partners.intro, 'partners.intro', 300, false),
      stats,
      brands,
      mailSubject: text(bag, partners.mailSubject, 'partners.mailSubject', 80),
    },
    socialsSection: {
      title: text(bag, socialsSection.title, 'socialsSection.title', 60),
      note: text(bag, socialsSection.note, 'socialsSection.note', 40, false),
    },
  };

  return { content, issues: bag };
}

/** As imagens carregadas no painel (/uploads) que este conteúdo usa. */
export function uploadsIn(content: EditableContent): Set<string> {
  const names = new Set<string>();
  for (const b of content.partners.brands) {
    for (const src of [b.image, b.thumb]) {
      if (src?.startsWith('/uploads/')) names.add(src.slice('/uploads/'.length));
    }
  }
  return names;
}
