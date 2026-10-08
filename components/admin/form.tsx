'use client';

import { createContext, type ReactNode, useContext, useId, useRef, useState } from 'react';
import type { EditableContent } from '@/content/types';

// As peças do formulário do painel. Cada campo liga-se ao conteúdo por um caminho
// ("partners.brands.2.name"): lê o valor de lá, escreve lá e mostra o erro que o servidor
// devolveu para esse caminho.

export type FormApi = {
  draft: EditableContent;
  /** Muda o valor num caminho. `undefined` apaga o campo (os opcionais ficam sem chave). */
  set: (path: string, value: unknown) => void;
  /** Erros da última tentativa de guardar, por caminho. */
  errors: Record<string, string>;
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

type TextProps = FieldProps & { path: string; max?: number; placeholder?: string; optional?: boolean };

export function TextField({ path, label, hint, max, placeholder, optional, type = 'text' }: TextProps & { type?: 'text' | 'url' | 'email' }) {
  const id = useId();
  const { value, set, error } = useField<string>(path);
  const text = value ?? '';
  return (
    <Field id={id} label={label} hint={hint} error={error} extra={<Count used={text.length} max={max} />}>
      <input
        id={id}
        type={type}
        className="input"
        value={text}
        maxLength={max}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        // Sem corretor nem maiúsculas automáticas: são nomes, códigos e links.
        spellCheck={type === 'text'}
        autoCapitalize={type === 'text' ? undefined : 'none'}
        onChange={(event) => set(optional && !event.target.value ? undefined : event.target.value)}
      />
    </Field>
  );
}

export function TextArea({ path, label, hint, max, placeholder, optional, rows = 3 }: TextProps & { rows?: number }) {
  const id = useId();
  const { value, set, error } = useField<string>(path);
  const text = value ?? '';
  return (
    <Field id={id} label={label} hint={hint} error={error} extra={<Count used={text.length} max={max} />}>
      <textarea
        id={id}
        className="input"
        rows={rows}
        value={text}
        maxLength={max}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(event) => set(optional && !event.target.value ? undefined : event.target.value)}
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
const Up = () => (
  <svg {...ICON}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);
const Down = () => (
  <svg {...ICON}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);
const Cross = () => (
  <svg {...ICON}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
const Chevron = () => (
  <svg {...ICON} className="chevron">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/** Lista de textos curtos (vantagens, palavras, etiquetas): uma caixa por linha. */
export function StringList({ path, label, hint, max, itemMax, addLabel, placeholder }: FieldProps & { path: string; max: number; itemMax: number; addLabel: string; placeholder?: string }) {
  const { draft, set, errors } = useForm();
  const items = (getAt(draft, path) as string[] | undefined) ?? [];
  const error = errors[path];
  return (
    <div className="field" role="group" aria-label={label} data-invalid={error ? true : undefined}>
      <span className="field-label">{label}</span>
      {items.map((item, i) => {
        const itemError = errors[`${path}.${i}`];
        return (
          // A posição serve de chave: as linhas não têm identidade própria e só mudam de sítio ao tirar uma.
          <div key={i} className="line" data-invalid={itemError ? true : undefined}>
            <div className="line-row">
              <input
                className="input"
                value={item}
                maxLength={itemMax}
                placeholder={placeholder}
                aria-label={`${label}, linha ${i + 1}`}
                aria-invalid={itemError ? true : undefined}
                onChange={(event) => set(`${path}.${i}`, event.target.value)}
              />
              <Tool label="Tirar esta linha" danger onClick={() => set(path, items.filter((_, j) => j !== i))}>
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
      <button type="button" className="add" disabled={items.length >= max} onClick={() => set(path, [...items, ''])}>
        + {addLabel}
      </button>
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

/** Lista de coisas com vários campos (marcas, redes, periféricos): acrescentar, tirar e trocar a ordem. */
export function Repeater<T>({ path, max, min = 0, addLabel, make, summary, confirmRemove, initialOpen, children }: RepeaterProps<T>) {
  const { draft, set, errors } = useForm();
  const items = (getAt(draft, path) as T[] | undefined) ?? [];
  // Uma chave por item, que o acompanha quando muda de posição: é ela que diz qual está aberto.
  // (Ao montar, a chave de cada item é a sua posição.)
  const [keys, setKeys] = useState<number[]>(() => items.map((_, i) => i));
  const nextKey = useRef(items.length);
  const [open, setOpen] = useState<number | null>(initialOpen ?? null);
  const keyAt = (i: number) => keys[i] ?? -1 - i;
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
  const move = (i: number, by: -1 | 1) => {
    const j = i + by;
    if (j < 0 || j >= items.length) return;
    const swap = <V,>(list: V[]) => {
      const copy = [...list];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    };
    set(path, swap(items));
    setKeys(swap(items.map((_, k) => keyAt(k))));
  };

  const tools = (i: number) => (
    <div className="tools">
      <Tool label="Subir" disabled={i === 0} onClick={() => move(i, -1)}>
        <Up />
      </Tool>
      <Tool label="Descer" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
        <Down />
      </Tool>
      <Tool label="Apagar" danger disabled={items.length <= min} onClick={() => remove(i)}>
        <Cross />
      </Tool>
    </div>
  );

  return (
    <div className="repeater" data-invalid={error ? true : undefined}>
      {items.map((item, i) => {
        const key = keyAt(i);
        const itemPath = `${path}.${i}`;
        if (!summary) {
          return (
            <div key={key} className="rep-row">
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
          <div key={key} className="rep-item" data-open={expanded} data-invalid={bad ? true : undefined}>
            <div className="rep-head">
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
