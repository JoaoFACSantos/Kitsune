'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { site } from '@/content/site.config';
import type { EditableContent } from '@/content/types';
import { adminStatus, checkPassword, clearFailures, clientIp, createSession, destroySession, endAllSessions, isAdmin, recordFailure, tooManyFailures } from '@/lib/admin/auth';
import { defaultContent, getContent } from '@/lib/content/site';
import { clearStored, pruneUploads, writeDraft, writeStored } from '@/lib/content/store';
import { type Issue, uploadsIn, validateContent } from '@/lib/content/validate';

// As ações do painel. Qualquer pessoa consegue enviar um POST para aqui sem passar pela
// página: cada uma confirma a sessão antes de fazer o que quer que seja.

export type LoginState = { error: string } | null;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  if (adminStatus() !== 'ready') return { error: 'O painel está desligado neste servidor.' };
  const ip = await clientIp();
  if (await tooManyFailures(ip)) return { error: 'Demasiadas tentativas. Espera uns minutos e tenta outra vez.' };
  const attempt = formData.get('password');
  if (typeof attempt !== 'string' || !checkPassword(attempt)) {
    await recordFailure(ip);
    // Meio segundo por tentativa falhada: quem anda a adivinhar não consegue ir depressa.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { error: 'Password errada.' };
  }
  await clearFailures(ip);
  await createSession();
  redirect('/admin');
}

export async function logout() {
  // Só quem está dentro fecha as sessões: de outro modo qualquer pessoa punha a streamer na rua.
  if (await isAdmin()) await endAllSessions();
  await destroySession();
  redirect('/admin');
}

export type SaveResult =
  | { ok: true; content: EditableContent; savedAt: string | null }
  /** 'auth': a sessão acabou. 'invalid': há campos por corrigir. 'storage': o servidor não conseguiu gravar. */
  | { ok: false; reason: 'auth' | 'invalid' | 'storage'; issues?: Issue[] };

/** O site inteiro volta a ser gerado no próximo pedido (página, imagem de partilha e metadados). */
function publish() {
  revalidatePath('/', 'layout');
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Junta o que chega do painel com o que está guardado. Um painel pode estar aberto há horas, ou
 * em dois aparelhos: o que lá está já pode não ser o que está guardado, e gravá-lo por inteiro
 * desfazia o que mudou entretanto (foi assim que uma hora de abertura já marcada se perdeu).
 * Por isso, de cada parte do conteúdo (redes, setup, parcerias, giveaways, manutenção…) só vale a
 * do painel se foi mexida lá desde que ele a leu (`base`); as outras ficam como estão guardadas.
 * Um painel aberto antes de isto existir não manda `base`: desse aceita-se tudo menos a
 * manutenção, que pode ter mudado sozinha (o site abre à hora marcada).
 */
function merge(content: EditableContent, base: EditableContent | null, stored: EditableContent): EditableContent {
  const merged = { ...content };
  for (const key of Object.keys(content) as (keyof EditableContent)[]) {
    const touched = base ? !same(content[key], base[key]) : key !== 'maintenance';
    if (!touched) Object.assign(merged, { [key]: stored[key] });
  }
  return merged;
}

/**
 * Um painel aberto antes de haver versão inglesa não sabe dela: manda os itens sem `en`. As
 * traduções guardadas ficam, item a item, reconhecido pelo nome (a marca, o periférico, o prémio…).
 */
function keepEnglish(sent: EditableContent, stored: EditableContent): EditableContent {
  const carry = <T extends { en?: unknown }>(items: T[], old: T[], name: (item: T) => string) => {
    const english = new Map(old.map((item) => [name(item), item.en]));
    return items.map((item) => (item.en || !english.get(name(item)) ? item : { ...item, en: english.get(name(item)) }));
  };
  return {
    ...sent,
    setup: { gear: carry(sent.setup.gear, stored.setup.gear, (g) => g.name), pc: carry(sent.setup.pc, stored.setup.pc, (s) => s.value) },
    partners: { brands: carry(sent.partners.brands, stored.partners.brands, (b) => b.name) },
    giveaways: {
      ...sent.giveaways,
      items: carry(sent.giveaways.items, stored.giveaways.items, (g) => g.title),
      rules: carry(sent.giveaways.rules, stored.giveaways.rules, (r) => r.title),
      winners: carry(sent.giveaways.winners, stored.giveaways.winners, (w) => `${w.name}·${w.prize}`),
    },
  };
}

/** `base` é o conteúdo que o painel tinha como guardado quando o leu (ver `merge`). */
export async function saveContent(input: unknown, base?: unknown): Promise<SaveResult> {
  if (!(await isAdmin())) return { ok: false, reason: 'auth' };
  const { content: sent, issues } = validateContent(input, defaultContent(), site.platform);
  if (issues.length) return { ok: false, reason: 'invalid', issues };
  try {
    const read = base === undefined ? null : validateContent(base, defaultContent(), site.platform).content;
    const stored = (await getContent()).content;
    const content = merge(read ? sent : keepEnglish(sent, stored), read, stored);
    const savedAt = await writeStored(content);
    await pruneUploads(uploadsIn(content));
    publish();
    return { ok: true, content, savedAt };
  } catch (error) {
    console.error('[painel] não consegui gravar', error);
    return { ok: false, reason: 'storage' };
  }
}

export type PreviewResult = { ok: true } | { ok: false; reason: 'auth' | 'invalid' | 'storage'; issues?: Issue[] };

/**
 * Deixa o que está no ecrã do painel pronto para a pré-visualização (/admin/ver), sem publicar
 * nada: o site continua como estava. Passa pela mesma validação de guardar, por isso o que se vê
 * é o que ficaria no site.
 */
export async function savePreview(input: unknown): Promise<PreviewResult> {
  if (!(await isAdmin())) return { ok: false, reason: 'auth' };
  const { content, issues } = validateContent(input, defaultContent(), site.platform);
  if (issues.length) return { ok: false, reason: 'invalid', issues };
  try {
    await writeDraft(content);
    return { ok: true };
  } catch (error) {
    console.error('[painel] não consegui guardar o rascunho', error);
    return { ok: false, reason: 'storage' };
  }
}

/** Apaga tudo o que foi mudado no painel: o site volta ao conteúdo de origem. */
export async function resetContent(): Promise<SaveResult> {
  if (!(await isAdmin())) return { ok: false, reason: 'auth' };
  try {
    await clearStored();
    publish();
    return { ok: true, content: defaultContent(), savedAt: null };
  } catch (error) {
    console.error('[painel] não consegui repor', error);
    return { ok: false, reason: 'storage' };
  }
}
