'use client';

import { useState } from 'react';

/** O código de uma parceria, com um botão que o copia. */
export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Sem acesso à área de transferência: o código está escrito, copia-se à mão.
    }
  };
  return (
    <div className="partner-code copy-code">
      <span className="flex min-w-0 flex-col">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">Código</span>
        <strong className="truncate">{code}</strong>
      </span>
      <button type="button" className="btn btn-ghost btn-sm ml-auto" onClick={copy} aria-live="polite">
        {copied ? 'Copiado ♡' : 'Copiar'}
      </button>
    </div>
  );
}
