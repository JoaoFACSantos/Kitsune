'use client';

import { scrollToTarget } from '@/components/providers/SmoothScroll';

export function BackToTop() {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
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
