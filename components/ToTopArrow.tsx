'use client';

import { useRef } from 'react';
import { ScrollTrigger, useGSAP } from '@/lib/gsap';

/**
 * Seta no canto de baixo, à direita, para voltar ao topo. Só aparece depois de se descer um pouco.
 * É um link para #topo: o scroll suave vem do SmoothScroll, e sem JS continua a funcionar.
 */
export function ToTopArrow() {
  const ref = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      let shown = false;
      // Aparece com pouco mais de meio ecrã descido e fica até ao fim da página.
      const update = (self: ScrollTrigger) => {
        const next = self.scroll() > window.innerHeight * 0.6;
        if (next === shown) return;
        shown = next;
        el.dataset.show = String(next);
      };
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update });
    },
    { scope: ref },
  );

  return (
    <a ref={ref} href="#topo" className="to-top" aria-label="Voltar ao topo" data-show="false">
      <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
      </svg>
    </a>
  );
}
