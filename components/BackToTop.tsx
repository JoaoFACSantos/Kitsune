'use client';

import { scrollToTarget } from '@/components/providers/SmoothScroll';

export function BackToTop() {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      // A seta do canto (ToTopArrow) procura este botão: sai de cena quando ele entra no ecrã.
      data-back-to-top
      onClick={() => {
        scrollToTarget('top');
        document.getElementById('topo')?.focus({ preventScroll: true });
      }}
    >
      Voltar ao topo
      <span aria-hidden className="arrow">
        ↑
      </span>
    </button>
  );
}
