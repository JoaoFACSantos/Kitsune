'use client';

import { createContext, type ReactNode, useContext, useEffect, useId, useRef, useState } from 'react';
import type { EditableContent } from '@/content/types';
import type { Lang } from '@/lib/i18n';

// As peças do formulário do painel. Cada campo liga-se ao conteúdo por um caminho
// ("partners.brands.2.name"): lê o valor de lá, escreve lá e mostra o erro que o servidor
// devolveu para esse caminho.

export type FormApi = {
  draft: EditableContent;
  /** Muda o valor num caminho. `undefined` apaga o campo (os opcionais ficam sem chave). */
  set: (path: string, value: unknown) => void;
  /** Erros da última tentativa de guardar, por caminho. */
  errors: Record<string, string>;
  /** A língua dos textos que se estão a escrever: o português, ou a versão inglesa do site (/en). */
  editLang?: Lang;
};

const FormContext = createContext<FormApi | null>(null);

export function FormProvider({ value, children }: { value: FormApi; children: ReactNode }) {
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useForm() {
  const form = useContext(FormContext);
  if (!form) throw new Error('Campo do painel fora do formulário');
  return form;
}

export function getAt(root: unknown, path: string): unknown {
  let node = root;
  for (const key of path.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return node;
}

/** Cópia de `root` com o valor trocado em `path` (o original fica intacto). */
export function setAt<T>(root: T, path: string, value: unknown): T {
  const dot = path.indexOf('.');
  const head = dot < 0 ? path : path.slice(0, dot);
  const rest = dot < 0 ? '' : path.slice(dot + 1);
  if (Array.isArray(root)) {
    const copy = [...root];
    copy[Number(head)] = rest ? setAt(copy[Number(head)] ?? {}, rest, value) : value;
    return copy as T;
  }
  const copy: Record<string, unknown> = { ...(root as Record<string, unknown>) };
  if (rest) copy[head] = setAt(copy[head] ?? {}, rest, value);
  else if (value === undefined) delete copy[head];
  else copy[head] = value;
  return copy as T;
}

/** Onde fica a versão inglesa de um campo de um item: "partners.brands.2.about" → "partners.brands.2.en.about". */
export const enPath = (path: string) => {
  const cut = path.lastIndexOf('.');
  return `${path.slice(0, cut)}.en.${path.slice(cut + 1)}`;
};

/**
 * Para onde escreve um campo: o próprio caminho ou, com o painel em inglês e o campo traduzível,
 * a versão inglesa. `original` é o texto em português, que fica a cinzento por baixo.
 */
function useTarget(path: string, translate?: boolean) {
  const { draft, editLang } = useForm();
  const english = Boolean(translate) && editLang === 'en';
  return { target: english ? enPath(path) : path, english, original: english ? getAt(draft, path) : undefined };
}

const EN_HINT = 'Versão inglesa (kitsuniverse.com/en). Em branco, aparece o texto em português, o que está a cinzento.';

/** A marca dos campos que, com o painel em inglês, escrevem a versão inglesa. */
const EnBadge = () => <span className="field-en">EN</span>;

function useField<T>(path: string) {
  const { draft, set, errors } = useForm();
  return { value: getAt(draft, path) as T | undefined, set: (value: T | undefined) => set(path, value), error: errors[path] };
}

/* ---------- Campos ---------- */

type FieldProps = { label: string; hint?: ReactNode };

/** Rótulo, campo e, por baixo, o erro (ou a dica, quando não há erro). */
export function Field({ id, label, hint, error, extra, children }: FieldProps & { id?: string; error?: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <div className="field" data-invalid={error ? true : undefined}>
      <label htmlFor={id} className="field-label">
        {label}
        {extra}
      </label>
      {children}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}

/** "34/40", só quando o texto já está perto do limite. */
function Count({ used, max }: { used: number; max?: number }) {
  if (!max || used < max * 0.7) return null;
  return (
    <span className="field-count" aria-hidden>
      {used}/{max}
    </span>
  );
}

type TextProps = FieldProps & {
  path: string;
  max?: number;
  placeholder?: string;
  optional?: boolean;
  /** Tem versão inglesa: com o painel em "English", escreve-se nela (ver useTarget). */
  translate?: boolean;
};

export function TextField({ path, label, hint, max, placeholder, optional, translate, type = 'text' }: TextProps & { type?: 'text' | 'url' | 'email' }) {
  const id = useId();
  const { target, english, original } = useTarget(path, translate);
  const { value, set, error } = useField<string>(target);
  const text = value ?? '';
  return (
    <Field
      id={id}
      label={label}
      hint={english ? EN_HINT : hint}
      error={error}
      extra={
        <>
          {english ? <EnBadge /> : null}
          <Count used={text.length} max={max} />
        </>
      }
    >
      <input
        id={id}
        type={type}
        className="input"
        value={text}
        maxLength={max}
        placeholder={english && typeof original === 'string' && original ? original : placeholder}
        aria-invalid={error ? true : undefined}
        // Sem corretor nem maiúsculas automáticas: são nomes, códigos e links.
        spellCheck={type === 'text'}
        autoCapitalize={type === 'text' ? undefined : 'none'}
        onChange={(event) => set((optional || english) && !event.target.value ? undefined : event.target.value)}
      />
    </Field>
  );
}

export function TextArea({ path, label, hint, max, placeholder, optional, translate, rows = 3 }: TextProps & { rows?: number }) {
  const id = useId();
  const { target, english, original } = useTarget(path, translate);
  const { value, set, error } = useField<string>(target);
  const text = value ?? '';
  return (
    <Field
      id={id}
      label={label}
      hint={english ? EN_HINT : hint}
      error={error}
      extra={
        <>
          {english ? <EnBadge /> : null}
          <Count used={text.length} max={max} />
        </>
      }
    >
      <textarea
        id={id}
        className="input"
        rows={rows}
        value={text}
        maxLength={max}
        placeholder={english && typeof original === 'string' && original ? original : placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(event) => set((optional || english) && !event.target.value ? undefined : event.target.value)}
      />
    </Field>
  );
}

export function NumberField({ path, label, hint, min = 0, max, placeholder }: FieldProps & { path: string; min?: number; max?: number; placeholder?: string }) {
  const id = useId();
  const { value, set, error } = useField<number>(path);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        className="input"
        value={value ?? ''}
        min={min}
        max={max}
        step={1}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(event) => {
          const next = event.target.valueAsNumber;
          // Vazio: os opcionais ficam sem valor; os obrigatórios são apanhados ao guardar.
          set(Number.isFinite(next) ? Math.round(next) : undefined);
        }}
      />
    </Field>
  );
}

export function SelectField<V extends string>({ path, label, hint, options, onPick }: FieldProps & { path: string; options: { value: V; label: string }[]; onPick?: (value: V) => void }) {
  const id = useId();
  const { value, set, error } = useField<V>(path);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        className="input"
        value={value ?? ''}
        aria-invalid={error ? true : undefined}
        onChange={(event) => {
          const next = event.target.value as V;
          set(next);
          onPick?.(next);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Check({ path, label, hint }: FieldProps & { path: string }) {
  const { value, set } = useField<boolean>(path);
  return (
    <label className="check">
      <input type="checkbox" checked={value === true} onChange={(event) => set(event.target.checked ? true : undefined)} />
      <span>
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </span>
    </label>
  );
}

/** Interruptor (ligado ou desligado), com a explicação ao lado. Guarda sempre true ou false. */
export function Toggle({ path, label, hint }: FieldProps & { path: string }) {
  const { value, set } = useField<boolean>(path);
  return (
    <label className="toggle">
      <input type="checkbox" role="switch" checked={value === true} onChange={(event) => set(event.target.checked)} />
      <span aria-hidden className="toggle-track" />
      <span className="toggle-text">
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </span>
    </label>
  );
}

/** Um dia do calendário ("2026-10-31"). Vazio, o campo fica sem valor. */
export function DateField({ path, label, hint, min }: FieldProps & { path: string; min?: string }) {
  const id = useId();
  const { value, set, error } = useField<string>(path);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        type="date"
        className="input"
        value={value ?? ''}
        min={min}
        aria-invalid={error ? true : undefined}
        onChange={(event) => set(event.target.value || undefined)}
      />
    </Field>
  );
}

/** "2026-10-13T17:10", pelo relógio de quem está a usar o painel: é o formato que o campo de dia e hora pede. */
function localStamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const two = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}T${two(date.getHours())}:${two(date.getMinutes())}`;
}

/** Um dia e uma hora, pelo relógio de quem usa o painel. Guarda o instante em ISO; vazio, o campo fica sem valor. */
export function DateTimeField({ path, label, hint }: FieldProps & { path: string }) {
  const id = useId();
  const { value, set, error } = useField<string>(path);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        type="datetime-local"
        className="input"
        value={value ? localStamp(value) : ''}
        aria-invalid={error ? true : undefined}
        onChange={(event) => {
          const date = new Date(event.target.value);
          set(event.target.value && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined);
        }}
      />
    </Field>
  );
}

export function ColorField({ path, label, hint }: FieldProps & { path: string }) {
  const id = useId();
  const { value, set, error } = useField<string>(path);
  const color = /^#[0-9a-f]{6}$/i.test(value ?? '') ? (value as string) : '#140a18';
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <span className="color">
        <input id={id} type="color" value={color} onChange={(event) => set(event.target.value)} />
        <code>{color}</code>
      </span>
    </Field>
  );
}

/* ---------- Listas ---------- */

function Tool({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button type="button" className="tool" data-danger={danger ? true : undefined} aria-label={label} title={label} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

const ICON = { viewBox: '0 0 24 24', 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const Cross = () => (
  <svg {...ICON}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
const Grip = () => (
  <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
    <circle cx="9" cy="6" r="1.7" />
    <circle cx="15" cy="6" r="1.7" />
    <circle cx="9" cy="12" r="1.7" />
    <circle cx="15" cy="12" r="1.7" />
    <circle cx="9" cy="18" r="1.7" />
    <circle cx="15" cy="18" r="1.7" />
  </svg>
);
const Chevron = () => (
  <svg {...ICON} className="chevron">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/**
 * Lista de textos curtos (vantagens, palavras, etiquetas): uma caixa por linha. Na versão inglesa
 * há uma linha por cada uma das portuguesas, com ela a cinzento por baixo.
 */
export function StringList({
  path,
  label,
  hint,
  max,
  itemMax,
  addLabel,
  placeholder,
  translate,
}: FieldProps & { path: string; max: number; itemMax: number; addLabel: string; placeholder?: string; translate?: boolean }) {
  const { draft, set, errors } = useForm();
  const { target, english, original } = useTarget(path, translate);
  const items = (getAt(draft, target) as string[] | undefined) ?? [];
  const originals = english && Array.isArray(original) ? (original as string[]) : [];
  const rows = Array.from({ length: Math.max(items.length, originals.length) }, (_, i) => items[i] ?? '');
  const error = errors[target];
  /** Escreve uma linha; na versão inglesa, as de antes que ainda não existam ficam em branco. */
  const write = (i: number, text: string) => {
    const next = [...items];
    while (next.length <= i) next.push('');
    next[i] = text;
    set(target, next);
  };
  return (
    <div className="field" role="group" aria-label={label} data-invalid={error ? true : undefined}>
      <span className="field-label">
        {label}
        {english ? <EnBadge /> : null}
      </span>
      {rows.map((item, i) => {
        const itemError = errors[`${target}.${i}`];
        return (
          // A posição serve de chave: as linhas não têm identidade própria e só mudam de sítio ao tirar uma.
          <div key={i} className="line" data-invalid={itemError ? true : undefined}>
            <div className="line-row">
              <input
                className="input"
                value={item}
                maxLength={itemMax}
                placeholder={originals[i] || placeholder}
                aria-label={`${label}, linha ${i + 1}`}
                aria-invalid={itemError ? true : undefined}
                onChange={(event) => write(i, event.target.value)}
              />
              <Tool label="Tirar esta linha" danger onClick={() => set(target, items.filter((_, j) => j !== i))}>
                <Cross />
              </Tool>
            </div>
            {itemError ? (
              <p className="field-error" role="alert">
                {itemError}
              </p>
            ) : null}
          </div>
        );
      })}
      <button type="button" className="add" disabled={rows.length >= max} onClick={() => write(rows.length, '')}>
        + {addLabel}
      </button>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : english ? (
        <p className="field-hint">{EN_HINT}</p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}

export type Summary = { title: string; subtitle?: string; media?: ReactNode };

type RepeaterProps<T> = {
  path: string;
  max: number;
  min?: number;
  addLabel: string;
  /** Um item novo, vazio. */
  make: () => T;
  /** Com resumo, cada item é uma caixa que abre e fecha; sem ele, os campos ficam todos à vista, em linha. */
  summary?: (item: T, index: number) => Summary;
  /** Pergunta antes de apagar (para o que dá trabalho a refazer). */
  confirmRemove?: (item: T) => string;
  /** O item que já aparece aberto (quem chega do Início vem para editar um em concreto). */
  initialOpen?: number;
  children: (itemPath: string, item: T, index: number) => ReactNode;
};

// Píxeis a partir dos quais um clique no cartão passa a contar como arrastar.
const DRAG_START_PX = 6;

/** O que se sabe de um cartão a ser arrastado: de onde saiu, para onde vai e onde estavam todos. */
type Drag = { id: number; from: number; to: number; startY: number; tops: number[]; heights: number[]; gap: number; cards: HTMLElement[]; moved: boolean };

const shift = <V,>(list: V[], from: number, to: number) => {
  const copy = [...list];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
};

/**
 * Lista de coisas com vários campos (marcas, redes, periféricos, peças do PC): acrescentar, tirar e
 * trocar a ordem. A ordem troca-se a arrastar pela pega do lado esquerdo, tanto nos cartões
 * (listas com resumo) como nas linhas simples; com o teclado, foco na pega e setas para cima e para baixo.
 */
export function Repeater<T>({ path, max, min = 0, addLabel, make, summary, confirmRemove, initialOpen, children }: RepeaterProps<T>) {
  const { draft, set, errors } = useForm();
  const items = (getAt(draft, path) as T[] | undefined) ?? [];
  // Uma chave por item, que o acompanha quando muda de posição: é ela que diz qual está aberto.
  // (Ao montar, a chave de cada item é a sua posição.)
  const [keys, setKeys] = useState<number[]>(() => items.map((_, i) => i));
  const nextKey = useRef(items.length);
  const [open, setOpen] = useState<number | null>(initialOpen ?? null);
  const keyAt = (i: number) => keys[i] ?? -1 - i;
  const listRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  // O clique que o browser dispara ao largar um cartão arrastado não o abre nem fecha.
  const skipClick = useRef(false);
  // O cartão cuja pega fica com o foco depois de mudar de sítio pelo teclado.
  const refocus = useRef<number | null>(null);
  const error = errors[path];
  const failing = (i: number) => Object.keys(errors).some((key) => key.startsWith(`${path}.${i}.`));

  const add = () => {
    const key = nextKey.current;
    nextKey.current += 1;
    set(path, [...items, make()]);
    setKeys([...items.map((_, i) => keyAt(i)), key]);
    setOpen(key);
  };
  const remove = (i: number) => {
    if (confirmRemove && !window.confirm(confirmRemove(items[i]))) return;
    set(
      path,
      items.filter((_, j) => j !== i),
    );
    setKeys(items.map((_, j) => keyAt(j)).filter((_, j) => j !== i));
  };
  const moveTo = (from: number, to: number) => {
    if (to < 0 || to >= items.length || to === from) return;
    set(path, shift(items, from, to));
    setKeys(
      shift(
        items.map((_, k) => keyAt(k)),
        from,
        to,
      ),
    );
  };

  // Ao mudar de sítio, o cartão pode perder o foco (o browser tira-o a um elemento que é movido).
  useEffect(() => {
    if (refocus.current === null) return;
    listRef.current?.querySelector<HTMLElement>(`:scope > [data-key="${refocus.current}"] .rep-grip`)?.focus();
    refocus.current = null;
  });

  /* Arrastar um cartão: com o rato pega-se em qualquer ponto do cabeçalho; com o dedo só na pega,
     para o resto do cartão continuar a fazer scroll. Uma linha simples tem os campos à vista, por
     isso só se pega nela pela pega (`gripOnly`). Enquanto se arrasta mexe-se só no estilo dos
     cartões; a lista muda uma vez, ao largar. */
  const dragStart = (event: React.PointerEvent<HTMLDivElement>, i: number, gripOnly = false) => {
    const target = event.target as Element;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (event.pointerType === 'mouse' && !gripOnly ? target.closest('.tools') : !target.closest('.rep-grip')) return;
    const cards = Array.from(listRef.current?.querySelectorAll<HTMLElement>(':scope > .rep-item, :scope > .rep-row') ?? []);
    if (cards.length < 2) return;
    const boxes = cards.map((card) => card.getBoundingClientRect());
    dragRef.current = {
      id: event.pointerId,
      from: i,
      to: i,
      startY: event.clientY,
      tops: boxes.map((box) => box.top),
      heights: boxes.map((box) => box.height),
      gap: boxes[1].top - boxes[0].bottom,
      cards,
      moved: false,
    };
  };
  const dragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.id) return;
    const dy = event.clientY - drag.startY;
    if (!drag.moved) {
      if (Math.abs(dy) < DRAG_START_PX) return;
      drag.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      if (listRef.current) listRef.current.dataset.sorting = 'true';
      drag.cards[drag.from].dataset.dragging = 'true';
    }
    const { from, tops, heights, cards } = drag;
    const last = cards.length - 1;
    // O cartão não sai da lista: pára no topo do primeiro e no fundo do último.
    const y = Math.min(tops[last] + heights[last] - tops[from] - heights[from], Math.max(tops[0] - tops[from], dy));
    cards[from].style.translate = `0 ${y}px`;
    // Troca de lugar com um vizinho quando a borda da frente passa o meio dele (a de cima ao
    // subir, a de baixo ao descer): assim chega-se ao primeiro e ao último lugar da lista.
    const top = tops[from] + y;
    const bottom = top + heights[from];
    let to = from;
    cards.forEach((_, j) => {
      const middle = tops[j] + heights[j] / 2;
      if (j < from && top < middle) to = Math.min(to, j);
      if (j > from && bottom > middle) to = Math.max(to, j);
    });
    drag.to = to;
    const step = heights[from] + drag.gap;
    cards.forEach((card, j) => {
      if (j === from) return;
      const offset = j >= to && j < from ? step : j > from && j <= to ? -step : 0;
      card.style.translate = offset ? `0 ${offset}px` : '';
    });
  };
  const dragEnd = (event: React.PointerEvent<HTMLDivElement>, drop: boolean) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.id) return;
    dragRef.current = null;
    if (!drag.moved) return;
    // Primeiro saem as transições, depois os desvios: os cartões ficam logo no sítio novo, sem voltar atrás.
    if (listRef.current) delete listRef.current.dataset.sorting;
    for (const card of drag.cards) {
      card.style.translate = '';
      delete card.dataset.dragging;
    }
    skipClick.current = true;
    window.setTimeout(() => {
      skipClick.current = false;
    }, 80);
    if (drop) moveTo(drag.from, drag.to);
  };

  const tools = (i: number) => (
    <div className="tools">
      <Tool label="Apagar" danger disabled={items.length <= min} onClick={() => remove(i)}>
        <Cross />
      </Tool>
    </div>
  );

  /** A pega: arrasta-se com o rato ou o dedo; com o teclado, as setas mudam o item de sítio. */
  const grip = (i: number, key: number, name: string) => (
    <button
      type="button"
      className="rep-grip"
      title="Arrastar para mudar a ordem"
      aria-label={`Mudar a ordem de ${name}: arrasta, ou usa as setas para cima e para baixo`}
      onKeyDown={(event) => {
        const to = event.key === 'ArrowUp' ? i - 1 : event.key === 'ArrowDown' ? i + 1 : null;
        if (to === null) return;
        event.preventDefault();
        refocus.current = key;
        moveTo(i, to);
      }}
    >
      <Grip />
    </button>
  );

  return (
    <div ref={listRef} className="repeater" data-invalid={error ? true : undefined}>
      {items.map((item, i) => {
        const key = keyAt(i);
        const itemPath = `${path}.${i}`;
        if (!summary) {
          return (
            <div
              key={key}
              className="rep-row"
              data-key={key}
              onPointerDown={(event) => dragStart(event, i, true)}
              onPointerMove={dragMove}
              onPointerUp={(event) => dragEnd(event, true)}
              onPointerCancel={(event) => dragEnd(event, false)}
            >
              {grip(i, key, `linha ${i + 1}`)}
              <div className="rep-fields">{children(itemPath, item, i)}</div>
              {tools(i)}
            </div>
          );
        }
        const info = summary(item, i);
        const bad = failing(i);
        // Um item com erros fica aberto, para se ver o que falta.
        const expanded = open === key || bad;
        return (
          <div key={key} className="rep-item" data-key={key} data-open={expanded} data-invalid={bad ? true : undefined}>
            <div
              className="rep-head"
              onPointerDown={(event) => dragStart(event, i)}
              onPointerMove={dragMove}
              onPointerUp={(event) => dragEnd(event, true)}
              onPointerCancel={(event) => dragEnd(event, false)}
              onClickCapture={(event) => {
                if (!skipClick.current) return;
                skipClick.current = false;
                event.preventDefault();
                event.stopPropagation();
              }}
            >
              {grip(i, key, info.title)}
              <button type="button" className="rep-toggle" aria-expanded={expanded} onClick={() => setOpen(open === key ? null : key)}>
                {info.media ? <span className="rep-media">{info.media}</span> : null}
                <span className="rep-title">
                  <strong>{info.title}</strong>
                  {info.subtitle ? <small>{info.subtitle}</small> : null}
                </span>
                {bad ? <span className="rep-flag">por corrigir</span> : null}
                <Chevron />
              </button>
              {tools(i)}
            </div>
            {expanded ? <div className="rep-body">{children(itemPath, item, i)}</div> : null}
          </div>
        );
      })}
      <button type="button" className="add" disabled={items.length >= max} onClick={add}>
        + {addLabel}
      </button>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ---------- Estrutura ---------- */

/** Um bloco do painel: título, uma frase a explicar e os campos. */
export function Card({ title, hint, children }: { title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <section className="admin-card glass">
      <header>
        <h2>{title}</h2>
        {hint ? <p>{hint}</p> : null}
      </header>
      {children}
    </section>
  );
}

/** Campos lado a lado em ecrãs largos. */
export function Row({ children }: { children: ReactNode }) {
  return <div className="field-row">{children}</div>;
}
