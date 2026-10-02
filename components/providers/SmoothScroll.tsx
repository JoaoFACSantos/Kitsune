'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { LENIS_LERP, MEDIA } from '@/lib/motion';

let lenis: Lenis | null = null;

/** Scroll suave até um elemento (ou ao topo), com foco para quem usa teclado. */
export function scrollToTarget(target: HTMLElement | 'top') {
  const el = target === 'top' ? null : target;
  const offset = -Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scroll-offset') || '0');
  const done = () => el?.focus({ preventScroll: true });
  if (lenis) {
    lenis.scrollTo(el ?? 0, { offset, duration: 1.2, onComplete: done });
    return;
  }
  const top = el ? el.getBoundingClientRect().top + window.scrollY + offset : 0;
  window.scrollTo({ top });
  done();
}

/** Pára o scroll da página enquanto um modal está aberto. */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
}

/** Lenis ligado ao ticker do GSAP. Sem Lenis com prefers-reduced-motion. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia(MEDIA.reduce);
    let tick: ((time: number) => void) | null = null;

    const start = () => {
      lenis = new Lenis({ lerp: LENIS_LERP, autoRaf: false });
      lenis.on('scroll', ScrollTrigger.update);
      const instance = lenis;
      tick = (time) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
    };
    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      tick = null;
      lenis?.destroy();
      lenis = null;
    };

    gsap.ticker.lagSmoothing(0);
    if (!reduce.matches) start();
    const onChange = () => {
      stop();
      if (!reduce.matches) start();
    };
    reduce.addEventListener('change', onChange);

    // Links âncora (#secao): scroll suave e foco na secção.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const id = decodeURIComponent(link.hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      event.preventDefault();
      history.replaceState(null, '', id === 'topo' ? location.pathname : `#${id}`);
      scrollToTarget(id === 'topo' ? 'top' : el);
    };
    document.addEventListener('click', onClick);

    // As fontes mudam a altura do texto: recalcula as posições quando estiverem prontas.
    document.fonts.ready.then(() => ScrollTrigger.refresh());

    return () => {
      reduce.removeEventListener('change', onChange);
      document.removeEventListener('click', onClick);
      stop();
    };
  }, []);

  return <>{children}</>;
}
