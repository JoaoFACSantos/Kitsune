'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { logout, resetContent, saveContent } from '@/app/admin/actions';
import type { EditableContent, SocialId } from '@/content/types';
import { StickerArt } from '@/components/icons';
import { LivePill } from '@/components/LivePill';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Issue } from '@/lib/content/validate';
import { Dashboard, type Overview, type Section } from './Dashboard';
import { Card, type FormApi, FormProvider, getAt, setAt } from './form';
import { ArrowIcon, LogoutIcon, NavGlyph, type NavIcon } from './icons';
import { emptyBrand, PartnersSection, SetupSection, SocialsSection, TextsSection } from './sections';

type EditorProps = {
  name: string;
  initial: EditableContent;
  /** Data da última gravação (ISO), ou null se o site ainda está com o conteúdo de origem. */
  savedAt: string | null;
  /** Redes cujo número de seguidores chega sozinho pela API. */
  auto: Partial<Record<SocialId, boolean>>;
  /** Números e clips para o resumo do Início. */
  overview: Overview;
  /** Cor da barra do browser em cada tema (para o switch claro/escuro). */
  themeColors: { light: string; dark: string };
};

// As secções do painel. `paths` são os campos do conteúdo que cada uma edita: é por eles que
// um erro ao guardar sabe em que secção aparecer.
const TABS: readonly { id: string; label: string; icon: NavIcon; hint: string; paths: readonly string[] }[] = [
  { id: 'inicio', label: 'Início', icon: 'home', hint: 'O site num relance e atalhos para o que mexes mais.', paths: [] },
  { id: 'parcerias', label: 'Parcerias', icon: 'partners', hint: 'As marcas, os códigos e o convite para quem quer trabalhar contigo.', paths: ['partners', 'email'] },
  { id: 'redes', label: 'Redes', icon: 'socials', hint: 'Os links e os seguidores de cada rede.', paths: ['socials', 'discord', 'socialsSection'] },
  { id: 'textos', label: 'Textos', icon: 'texts', hint: 'As frases do topo do site e da secção dos clips.', paths: ['role', 'tagline', 'hero', 'clips'] },
  { id: 'setup', label: 'Setup', icon: 'setup', hint: 'Os periféricos, o PC e as estatísticas a brincar.', paths: ['setup'] },
  { id: 'definicoes', label: 'Definições', icon: 'settings', hint: 'Como o painel funciona e como voltar ao site de origem.', paths: [] },
];

type Status = { kind: 'idle' } | { kind: 'saved' } | { kind: 'error'; text: string };

const under = (path: string, roots: readonly string[]) => roots.some((root) => path === root || path.startsWith(`${root}.`));

// Como se chama cada campo, para a lista de erros ("Marcas › Zumub › Link").
const FIELD_NAMES: Record<string, string> = {
  name: 'Nome',
  category: 'O que é',
  perk: 'Vantagem principal',
  about: 'Sobre a marca',
  perks: 'Vantagens',
  code: 'Código',
  url: 'Link',
  cta: 'Texto do botão',
  image: 'Imagem',
  thumb: 'Miniatura',
  note: 'Aviso',
  value: 'Número',
  label: 'Nome',
  handle: 'Nome de utilizador',
  followers: 'Seguidores',
  id: 'Rede',
  icon: 'Desenho',
  tags: 'Etiquetas',
  title: 'Título',
  intro: 'Texto',
  greeting: 'Frase por cima do nome',
  ribbon: 'Palavras da fita',
  moreUrl: 'Link dos clips',
  recentDays: 'Dias dos clips',
  members: 'Membros',
  mailSubject: 'Assunto do email',
  role: 'O que fazes',
  tagline: 'Frase de apresentação',
  email: 'Email',
  brands: 'Marcas',
  stats: 'Números',
  gear: 'Periféricos',
  pc: 'O PC',
  funStats: 'Estatísticas',
  socials: 'Redes',
};

/** "partners.brands.1.url" → "Marcas › Zumub › Link". */
function describe(path: string, draft: EditableContent) {
  const parts = path.split('.');
  const words: string[] = [];
  parts.forEach((part, i) => {
    if (/^\d+$/.test(part)) {
      const item = getAt(draft, parts.slice(0, i + 1).join('.'));
      const named = typeof item === 'object' && item !== null ? ((item as { name?: string; label?: string }).name ?? (item as { label?: string }).label) : null;
      words.push(named || `n.º ${Number(part) + 1}`);
    } else if (FIELD_NAMES[part] && (i > 0 || parts.length === 1)) {
      words.push(FIELD_NAMES[part]);
    }
  });
  return words.join(' › ');
}

/** Tira as linhas em branco das listas de texto: uma caixa vazia não é um erro, é só para ignorar. */
function tidy(content: EditableContent): EditableContent {
  const lines = (list: string[] | undefined) => (list ?? []).map((line) => line.trim()).filter(Boolean);
  return {
    ...content,
    hero: { ...content.hero, ribbon: lines(content.hero.ribbon) },
    setup: { ...content.setup, gear: content.setup.gear.map((gear) => ({ ...gear, tags: lines(gear.tags) })) },
    partners: { ...content.partners, brands: content.partners.brands.map((brand) => ({ ...brand, perks: lines(brand.perks) })) },
  };
}

/** O painel: a barra das secções, o conteúdo em rascunho e o botão de guardar sempre à mão. */
export function Editor({ name, initial, savedAt: initialSavedAt, auto, overview, themeColors }: EditorProps) {
  // `saved` é o que está publicado; `draft` é o que está no ecrã. Diferentes: há coisas por guardar.
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [savedAt, setSavedAt] = useState(initialSavedAt);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  // A secção à vista e, vindo do Início, o item que lá deve aparecer aberto.
  const [view, setView] = useState<{ tab: string; open?: number }>({ tab: 'inicio' });
  // Muda quando o rascunho é trocado de uma vez (descartar, repor): os campos voltam a montar, fechados.
  const [version, setVersion] = useState(0);
  const [busy, startTransition] = useTransition();

  const tab = TABS.find((t) => t.id === view.tab) ?? TABS[0];
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const errors = useMemo(() => Object.fromEntries(issues.map((issue) => [issue.path, issue.message])), [issues]);

  const set = useCallback((path: string, value: unknown) => {
    setDraft((current) => setAt(current, path, value));
    // Mexeu no campo (ou na lista): os erros dele deixam de valer.
    setIssues((list) => list.filter((issue) => issue.path !== path && !issue.path.startsWith(`${path}.`)));
    setStatus({ kind: 'idle' });
  }, []);

  const form = useMemo<FormApi>(() => ({ draft, set, errors }), [draft, set, errors]);

  // Avisa antes de fechar o separador com coisas por guardar.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Secção nova: começa-se em cima, ou no item que vinha para ser aberto.
  useEffect(() => {
    // No telemóvel as secções passam de lado: a escolhida vem para a vista.
    const active = document.querySelector('.admin-tab[aria-current="page"]');
    const strip = active?.parentElement;
    if (active && strip) strip.scrollTo({ left: strip.scrollLeft + active.getBoundingClientRect().left - strip.getBoundingClientRect().left - 14 });
    const target = view.open === undefined ? null : document.querySelector('.rep-item[data-open="true"]');
    if (target) target.scrollIntoView({ block: 'start' });
    else window.scrollTo({ top: 0 });
  }, [view]);

  const show = (id: string) => setView({ tab: id });

  /** Do Início para uma secção, já com um item aberto (ou com um novo acabado de criar). */
  const go = (section: Section, open?: number | 'new') => {
    if (open !== 'new') return setView({ tab: section, open });
    // Só as parcerias se criam a partir do Início.
    setDraft((current) => setAt(current, 'partners.brands', [...current.partners.brands, emptyBrand()]));
    setStatus({ kind: 'idle' });
    setView({ tab: 'parcerias', open: draft.partners.brands.length });
  };

  const replace = (content: EditableContent, at: string | null) => {
    setSaved(content);
    setDraft(content);
    setSavedAt(at);
    setIssues([]);
  };

  const fail = (reason: 'auth' | 'invalid' | 'storage', found: Issue[] = []) => {
    if (reason === 'invalid') {
      setIssues(found);
      const first = found[0];
      const where = first ? TABS.find((t) => under(first.path, t.paths)) : null;
      if (where) show(where.id);
      setStatus({ kind: 'error', text: found.length === 1 ? 'Falta corrigir uma coisa.' : `Falta corrigir ${found.length} coisas.` });
    } else if (reason === 'auth') {
      setStatus({ kind: 'error', text: 'A sessão acabou. Abre o painel noutro separador, entra outra vez e volta aqui para guardar.' });
    } else {
      setStatus({ kind: 'error', text: 'O servidor não conseguiu guardar. Tenta outra vez; se continuar, fala com quem trata do site.' });
    }
  };

  const save = () =>
    startTransition(async () => {
      try {
        const result = await saveContent(tidy(draft));
        if (!result.ok) return fail(result.reason, result.issues);
        replace(result.content, result.savedAt);
        setStatus({ kind: 'saved' });
      } catch {
        setStatus({ kind: 'error', text: 'Sem ligação ao servidor. O que escreveste continua aqui: tenta guardar outra vez.' });
      }
    });

  const discard = () => {
    if (!window.confirm('Descartar o que mudaste desde a última gravação?')) return;
    setDraft(saved);
    setIssues([]);
    setStatus({ kind: 'idle' });
    setVersion((v) => v + 1);
  };

  const reset = () => {
    if (!window.confirm('Repor o site como estava de origem? Tudo o que foi mudado no painel desaparece do site.')) return;
    startTransition(async () => {
      try {
        const result = await resetContent();
        if (!result.ok) return fail(result.reason);
        replace(result.content, result.savedAt);
        setVersion((v) => v + 1);
        setStatus({ kind: 'saved' });
      } catch {
        setStatus({ kind: 'error', text: 'Sem ligação ao servidor. Tenta outra vez.' });
      }
    });
  };

  // O estado da gravação, numa palavra (a etiqueta) e numa frase (para leitores de ecrã e telemóvel).
  const state = busy ? 'saving' : status.kind === 'error' ? 'error' : dirty ? 'dirty' : status.kind === 'saved' ? 'saved' : 'clean';

  return (
    <FormProvider value={form}>
      <div className="admin-shell">
        <aside className="admin-side glass">
          <div className="admin-brand">
            <span aria-hidden className="admin-brand-mark">
              <StickerArt kind="fox" />
            </span>
            <span className="admin-brand-text">
              <span className="nav-name">{name}</span>
              <small>painel</small>
            </span>
          </div>

          <nav className="admin-tabs" aria-label="Secções do painel">
            {TABS.map((t) => {
              const count = issues.filter((issue) => under(issue.path, t.paths)).length;
              return (
                <button key={t.id} type="button" className="admin-tab" aria-current={tab.id === t.id ? 'page' : undefined} onClick={() => show(t.id)}>
                  <NavGlyph icon={t.icon} />
                  <span>{t.label}</span>
                  {count ? (
                    <span className="admin-tab-flag">
                      {count}
                      <span className="sr-only"> por corrigir</span>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="admin-side-foot">
            <LivePill />
            <div className="admin-top-actions">
              <a href="/" target="_blank" rel="noopener noreferrer" className="admin-link">
                Ver o site
                <ArrowIcon />
              </a>
              <ThemeToggle lightColor={themeColors.light} darkColor={themeColors.dark} />
            </div>
            <form action={logout}>
              <button type="submit" className="admin-link">
                <LogoutIcon />
                Sair
              </button>
            </form>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-head">
            <div className="admin-head-text">
              <h1>{tab.label}</h1>
              <p>{tab.hint}</p>
            </div>
            <div className="admin-save" data-dirty={dirty} data-status={status.kind} data-state={state}>
              <p role="status">
                <span aria-hidden className="admin-save-dot" />
                <span>
                  {busy ? (
                    'A guardar…'
                  ) : status.kind === 'error' ? (
                    status.text
                  ) : status.kind === 'saved' && !dirty ? (
                    'Guardado ♡ O site já tem as alterações.'
                  ) : dirty ? (
                    'Tens alterações por guardar.'
                  ) : savedAt ? (
                    <>
                      Tudo guardado ·{' '}
                      <time dateTime={savedAt} suppressHydrationWarning>
                        {new Date(savedAt).toLocaleString('pt-PT', { dateStyle: 'medium', timeStyle: 'short' })}
                      </time>
                    </>
                  ) : (
                    'O site está com o conteúdo de origem.'
                  )}
                </span>
              </p>
              <div className="admin-save-actions">
                {dirty ? (
                  <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={discard}>
                    Descartar
                  </button>
                ) : null}
                <button type="button" className="btn btn-primary btn-sm" disabled={busy || !dirty} onClick={save}>
                  Guardar e publicar
                </button>
              </div>
            </div>
          </header>

          {issues.length ? (
            <div className="admin-issues" role="alert">
              <strong>Antes de guardar, falta corrigir:</strong>
              <ul>
                {issues.slice(0, 8).map((issue, i) => (
                  // Pode haver dois problemas no mesmo campo: a posição entra na chave.
                  <li key={`${issue.path}:${i}`}>
                    <button
                      type="button"
                      onClick={() => {
                        const where = TABS.find((t) => under(issue.path, t.paths));
                        if (where) show(where.id);
                      }}
                    >
                      {describe(issue.path, draft) || 'Campo'}
                    </button>
                    : {issue.message}
                  </li>
                ))}
                {issues.length > 8 ? <li>e mais {issues.length - 8}.</li> : null}
              </ul>
            </div>
          ) : null}

          {/* A chave junta a secção e o item a abrir: quem chega do Início encontra-o já aberto. */}
          <div key={`${version}:${view.tab}:${view.open ?? ''}`} className="admin-sections">
            {tab.id === 'inicio' ? <Dashboard name={name} overview={overview} dirty={dirty} savedAt={savedAt} go={go} /> : null}
            {tab.id === 'parcerias' ? <PartnersSection open={view.open} /> : null}
            {tab.id === 'redes' ? <SocialsSection auto={auto} open={view.open} /> : null}
            {tab.id === 'textos' ? <TextsSection /> : null}
            {tab.id === 'setup' ? <SetupSection /> : null}
            {tab.id === 'definicoes' ? (
              <>
                <Card title="Como funciona">
                  <ul className="admin-help">
                    <li>Muda o que quiseres nas secções e carrega em «Guardar e publicar». O site fica atualizado nesse momento.</li>
                    <li>Enquanto não guardares, nada muda no site. «Descartar» volta ao que estava guardado.</li>
                    <li>O estado do direto, os clips e os seguidores da Twitch vêm sozinhos da Twitch: não se mexem aqui.</li>
                    <li>O nome, as cores e a imagem do topo não estão no painel: para esses, fala com quem trata do site.</li>
                  </ul>
                </Card>
                <Card
                  title="Repor o site de origem"
                  hint="Apaga tudo o que foi mudado no painel e volta ao conteúdo com que o site foi feito. Fica uma cópia de segurança no servidor."
                >
                  <div>
                    <button type="button" className="btn btn-ghost btn-sm admin-danger" disabled={busy || savedAt === null} onClick={reset}>
                      Repor tudo como estava
                    </button>
                  </div>
                  {savedAt === null ? <p className="field-hint">O site já está com o conteúdo de origem.</p> : null}
                </Card>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
