'use client';

import { useEffect, useRef } from 'react';
import { HeartShape } from '@/components/icons';
import { MEDIA } from '@/lib/motion';

const COLORS = ['var(--pink)', 'var(--pink-deep)', 'var(--lilac)', 'var(--butter)'];
const POOL = 16;
const PER_CLICK = 4;

/**
 * Efeito leve do cursor: a cada clique saem 4 mini-corações da ponta do cursor.
 * O cursor em si é nativo (ver lib/cursor.ts), por isso não há nada a seguir o rato.
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = root.current;
    if (!layer || !window.matchMedia(MEDIA.fine).matches || window.matchMedia(MEDIA.reduce).matches) return;
    const hearts = [...layer.querySelectorAll<HTMLElement>('.fx-heart')];
    let index = 0;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      const { clientX: x, clientY: y } = event;
      for (let k = 0; k < PER_CLICK; k++) {
        const el = hearts[index % POOL];
        index += 1;
        el.style.color = COLORS[index % COLORS.length];
        // Leque para cima, com um pouco de variação.
        const angle = -Math.PI / 2 + (k - (PER_CLICK - 1) / 2) * 0.6 + (Math.random() - 0.5) * 0.25;
        const distance = 20 + Math.random() * 12;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        el.animate(
          [
            { transform: `translate(${x}px, ${y}px) scale(0.3)`, opacity: 1 },
            { transform: `translate(${x + dx}px, ${y + dy}px) scale(1)`, opacity: 0.95, offset: 0.5 },
            { transform: `translate(${x + dx * 1.4}px, ${y + dy * 1.4 - 6}px) scale(0.4)`, opacity: 0 },
          ],
          { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' },
        );
      }
    };

    document.addEventListener('pointerdown', onDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  return (
    <div ref={root} aria-hidden className="fx-layer">
      {Array.from({ length: POOL }, (_, i) => (
        <span key={i} className="fx-heart">
          <HeartShape className="h-full w-full" />
        </span>
      ))}
    </div>
  );
}
