import type { Brand, EditableContent, Gear, GearIcon, Giveaway, Rule, Social, SocialId, Spec, Winner } from '@/content/types';
import { brandSlug, GEAR_ICONS, IMAGE_PATH, MAX, RESERVED_SLUGS, SLUG, slugify, SOCIAL_IDS, SOCIAL_LABELS } from './editable';

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
  // O link curto escreve-se à vontade ("Zumub 10"): fica só o que cabe num endereço.
  const slug = slugify(text(bag, v.slug, `${path}.slug`, 40, false));
  if (slug && !SLUG.test(slug)) bag.push({ path: `${path}.slug`, message: 'De 2 a 24 letras minúsculas, números ou hífenes.' });
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
    ...(slug ? { slug } : {}),
  };
}

function rule(bag: Bag, value: unknown, path: string): Rule {
  const v = record(value);
  return { title: text(bag, v.title, `${path}.title`, 60), text: text(bag, v.text, `${path}.text`, 500) };
}

/** Um dia do calendário ("2026-10-31"), ou nada. */
function day(value: unknown): string | undefined {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
  // 31 de fevereiro passa no formato: a data tem de dar a volta e sair igual.
  const date = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw ? undefined : raw;
}

function giveaway(bag: Bag, value: unknown, path: string): Giveaway {
  const v = record(value);
  const size = record(v.imageSize);
  const picture = image(bag, v.image, `${path}.image`, false);
  const url = link(bag, v.url, `${path}.url`, false);
  const steps = list(bag, v.steps, `${path}.steps`, MAX.giveawaySteps, (entry, p) => text(bag, entry, p, 140));
  unique(bag, steps, `${path}.steps`, (step) => step, '');
  const endsAt = day(v.endsAt);
  if (!endsAt && typeof v.endsAt === 'string' && v.endsAt.trim()) bag.push({ path: `${path}.endsAt`, message: 'Data inválida: escolhe-a outra vez.' });
  return {
    title: text(bag, v.title, `${path}.title`, 60),
    about: text(bag, v.about, `${path}.about`, 300, false),
    steps,
    ...(url ? { url } : {}),
    cta: text(bag, v.cta, `${path}.cta`, 40, false) || 'Participar',
    ...(picture ? { image: picture, imageSize: { width: dimension(size.width), height: dimension(size.height) } } : {}),
    ...(endsAt ? { endsAt } : {}),
  };
}

function winner(bag: Bag, value: unknown, path: string): Winner {
  const v = record(value);
  const date = day(v.date);
  if (!date && typeof v.date === 'string' && v.date.trim()) bag.push({ path: `${path}.date`, message: 'Data inválida: escolhe-a outra vez.' });
  return { name: text(bag, v.name, `${path}.name`, 40), prize: text(bag, v.prize, `${path}.prize`, 60), ...(date ? { date } : {}) };
}

/** O código de um link de convite do Discord ("https://discord.gg/abc" → "abc"). */
const inviteCode = (url: string | undefined) => /(?:discord\.gg\/|discord(?:app)?\.com\/invite\/)([\w-]{2,40})/i.exec(url ?? '')?.[1];

/** Um código de convite escrito à mão (ou o link inteiro): fica só o código. */
function discordInvite(value: unknown): string {
  const raw = typeof value === 'string' ? value.trim() : '';
  const code = inviteCode(raw) ?? raw;
  return /^[\w-]{2,40}$/.test(code) ? code : '';
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

  const discord = part('discord');
  const setup = part('setup');
  const partners = part('partners');
  const giveaways = part('giveaways');
  const maintenance = part('maintenance');

  const socials = list(bag, top('socials'), 'socials', MAX.socials, (entry, p) => social(bag, entry, p), 1);
  unique(bag, socials, 'socials', (s) => s.id, 'id');
  if (!socials.some((s) => s.id === platform)) {
    bag.push({ path: 'socials', message: `Falta a ${SOCIAL_LABELS[platform]}: é a rede principal, os botões do site apontam para ela.` });
  }

  const gearList = list(bag, setup.gear, 'setup.gear', MAX.gear, (entry, p) => gear(bag, entry, p), 1);
  unique(bag, gearList, 'setup.gear', (g) => g.name, 'name');
  const pc = list(bag, setup.pc, 'setup.pc', MAX.pc, (entry, p) => spec(bag, entry, p));
  unique(bag, pc, 'setup.pc', (s) => s.label, 'label');

  const brands = list(bag, partners.brands, 'partners.brands', MAX.brands, (entry, p) => brand(bag, entry, p));
  unique(bag, brands, 'partners.brands', (b) => b.name, 'name');
  // Os links curtos (o escrito ou o que sai do nome) não se podem repetir nem tapar páginas do site.
  unique(bag, brands, 'partners.brands', brandSlug, 'slug');
  brands.forEach((b, i) => {
    if (RESERVED_SLUGS.has(brandSlug(b))) bag.push({ path: `partners.brands.${i}.slug`, message: 'Esse endereço já é de uma página do site: escolhe outro.' });
  });

  const giveawayList = list(bag, giveaways.items, 'giveaways.items', MAX.giveaways, (entry, p) => giveaway(bag, entry, p));
  unique(bag, giveawayList, 'giveaways.items', (g) => g.title, 'title');
  const rules = list(bag, giveaways.rules, 'giveaways.rules', MAX.rules, (entry, p) => rule(bag, entry, p));
  unique(bag, rules, 'giveaways.rules', (r) => r.title, 'title');
  const winners = list(bag, giveaways.winners, 'giveaways.winners', MAX.winners, (entry, p) => winner(bag, entry, p));

  // A hora de abrir só existe com a manutenção ligada. Fica sempre no mesmo formato (ISO, em UTC).
  let opensAt: string | undefined;
  if (maintenance.active === true && maintenance.opensAt !== undefined) {
    const time = typeof maintenance.opensAt === 'string' && maintenance.opensAt.length <= 40 ? Date.parse(maintenance.opensAt) : Number.NaN;
    if (Number.isNaN(time)) bag.push({ path: 'maintenance.opensAt', message: 'Escolhe um dia e uma hora, ou deixa em branco.' });
    else opensAt = new Date(time).toISOString();
  }

  const content: EditableContent = {
    socials,
    discord: {
      // O convite sai do link do Discord na lista de redes: é por ele que se contam os membros.
      invite: inviteCode(socials.find((s) => s.id === 'discord')?.url) ?? discordInvite(discord.invite),
      members: int(bag, discord.members, 'discord.members', 0, 100_000_000),
    },
    setup: { gear: gearList, pc },
    partners: { brands },
    giveaways: { active: giveaways.active === true, items: giveawayList, rules, winners },
    maintenance: { active: maintenance.active === true, ...(opensAt ? { opensAt } : {}) },
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
  for (const g of content.giveaways.items) {
    if (g.image?.startsWith('/uploads/')) names.add(g.image.slice('/uploads/'.length));
  }
  return names;
}
