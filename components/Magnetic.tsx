'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { FOLLOW, MEDIA } from '@/lib/motion';

/** Puxa o conteúdo na direção do cursor (botões "magnéticos"). */
export function Magnetic({ children, strength = 0.3, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia(MEDIA.fine).matches || window.matchMedia(MEDIA.reduce).matches) return;
    const xTo = gsap.quickTo(el, 'x', { duration: FOLLOW.fast, ease: FOLLOW.ease });
    const yTo = gsap.quickTo(el, 'y', { duration: FOLLOW.fast, ease: FOLLOW.ease });
    const onMove = (event: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((event.clientX - (r.left + r.width / 2)) * strength);
      yTo((event.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return (
    <span ref={ref} className={className ?? 'inline-flex'}>
      {children}
    </span>
  );
}
