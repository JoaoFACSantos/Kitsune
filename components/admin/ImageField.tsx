'use client';

import { useId, useRef, useState } from 'react';
import { getAt, useForm } from './form';

type ImageFieldProps = {
  /** Onde fica o endereço da imagem. */
  path: string;
  label: string;
  hint?: string;
  /** Onde fica o tamanho real ({ width, height }), se o conteúdo o guardar. */
  sizePath?: string;
  /** Onde fica o ponto de foco ("25% 50%"). Com isto, clica-se na imagem para o escolher. */
  focusPath?: string;
  /** Cor que se vê atrás da imagem na miniatura. */
  tint?: string;
  /** A imagem que o cartão pequeno mostra, se não for esta (uma miniatura própria). */
  preview?: string;
  /** Pode ficar sem imagem (mostra o botão de tirar). */
  optional?: boolean;
};

const percent = (value: number) => Math.min(100, Math.max(0, Math.round(value * 100)));

/** Escolher uma imagem do computador: envia-a para o servidor e guarda o endereço que ele devolve. */
export function ImageField({ path, label, hint, sizePath, focusPath, tint, preview, optional }: ImageFieldProps) {
  const id = useId();
  const { draft, set, errors } = useForm();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const src = getAt(draft, path) as string | undefined;
  const focus = focusPath ? ((getAt(draft, focusPath) as string | undefined) ?? '50% 50%') : '50% 50%';
  const [focusX = '50%', focusY = '50%'] = focus.split(' ');
  const error = problem ?? errors[path];

  const upload = async (file: File) => {
    setBusy(true);
    setProblem(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/admin/upload', { method: 'POST', body });
      const data = (await response.json().catch(() => null)) as { url?: string; width?: number; height?: number; error?: string } | null;
      if (!response.ok || !data?.url) {
        setProblem(data?.error ?? 'Não consegui enviar a imagem. Tenta outra vez.');
        return;
      }
      set(path, data.url);
      if (sizePath) set(sizePath, { width: data.width, height: data.height });
      // Imagem nova: o foco antigo já não faz sentido, volta ao centro.
      if (focusPath) set(focusPath, undefined);
    } catch {
      setProblem('Sem ligação ao servidor. Tenta outra vez.');
    } finally {
      setBusy(false);
      // Para se poder escolher o mesmo ficheiro outra vez.
      if (input.current) input.current.value = '';
    }
  };

  const pickFocus = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Enter ou espaço (sem posição do rato): não mexe no foco.
    if (!focusPath || event.detail === 0) return;
    const box = event.currentTarget.getBoundingClientRect();
    set(focusPath, `${percent((event.clientX - box.left) / box.width)}% ${percent((event.clientY - box.top) / box.height)}%`);
  };

  return (
    <div className="field image-field" data-invalid={error ? true : undefined}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {src ? (
        <div className="image-edit">
          {focusPath ? (
            <button type="button" className="image-pick" onClick={pickFocus} aria-label="Clica na parte da imagem que deve ficar à vista no cartão pequeno">
              {/* eslint-disable-next-line @next/next/no-img-element -- pré-visualização no painel, sem otimização */}
              <img src={src} alt="" draggable={false} />
              <span aria-hidden className="image-dot" style={{ left: focusX, top: focusY }} />
            </button>
          ) : (
            <span className="image-pick" data-static>
              {/* eslint-disable-next-line @next/next/no-img-element -- pré-visualização no painel, sem otimização */}
              <img src={src} alt="" draggable={false} />
            </span>
          )}
          <div className="image-side">
            {focusPath ? (
              <>
                <span className="image-thumb" style={{ background: tint }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- pré-visualização no painel, sem otimização */}
                  <img src={preview ?? src} alt="" style={{ objectPosition: focus }} draggable={false} />
                </span>
                <p className="field-hint">
                  {preview
                    ? 'Assim fica no cartão pequeno, com a miniatura própria (em «Mais opções»).'
                    : 'Assim fica no cartão pequeno. Clica na imagem ao lado para escolher a parte que aparece.'}
                </p>
              </>
            ) : null}
            <div className="image-actions">
              <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => input.current?.click()}>
                {busy ? 'A enviar…' : 'Trocar imagem'}
              </button>
              {optional ? (
                <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => set(path, undefined)}>
                  Tirar
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <button type="button" className="image-empty" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? 'A enviar…' : 'Escolher imagem'}
        </button>
      )}
      <input
        ref={input}
        id={id}
        type="file"
        className="sr-only"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
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
