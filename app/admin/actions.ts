'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { site } from '@/content/site.config';
import type { EditableContent } from '@/content/types';
import { adminStatus, checkPassword, clearFailures, clientIp, createSession, destroySession, isAdmin, recordFailure, tooManyFailures } from '@/lib/admin/auth';
import { defaultContent } from '@/lib/content/site';
import { clearStored, pruneUploads, writeStored } from '@/lib/content/store';
import { type Issue, uploadsIn, validateContent } from '@/lib/content/validate';

// As ações do painel. Qualquer pessoa consegue enviar um POST para aqui sem passar pela
// página: cada uma confirma a sessão antes de fazer o que quer que seja.

export type LoginState = { error: string } | null;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  if (adminStatus() !== 'ready') return { error: 'O painel está desligado neste servidor.' };
  const ip = await clientIp();
  if (tooManyFailures(ip)) return { error: 'Demasiadas tentativas. Espera uns minutos e tenta outra vez.' };
  const attempt = formData.get('password');
  if (typeof attempt !== 'string' || !checkPassword(attempt)) {
    recordFailure(ip);
    // Meio segundo por tentativa falhada: quem anda a adivinhar não consegue ir depressa.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { error: 'Password errada.' };
  }
  clearFailures(ip);
  await createSession();
  redirect('/admin');
}

export async function logout() {
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

export async function saveContent(input: unknown): Promise<SaveResult> {
  if (!(await isAdmin())) return { ok: false, reason: 'auth' };
  const { content, issues } = validateContent(input, defaultContent(), site.platform);
  if (issues.length) return { ok: false, reason: 'invalid', issues };
  try {
    const savedAt = await writeStored(content);
    await pruneUploads(uploadsIn(content));
    publish();
    return { ok: true, content, savedAt };
  } catch (error) {
    console.error('[painel] não consegui gravar', error);
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
