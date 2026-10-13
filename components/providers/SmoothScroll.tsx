'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { LENIS_LERP, MEDIA } from '@/lib/motion';
import { PREVIEW_PATH } from '@/lib/preview';

let lenis: Lenis | null = null;

/**
 * Quanto falta do topo do elemento até ao sítio onde o scroll pára.
 * Conta o conteúdo e não o espaço em branco da secção: se couber no ecrã, fica ao centro do que
 * sobra por baixo do menu; se não couber, começa logo por baixo do menu.
 */
function landing(el: HTMLElement) {
  const menu = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scroll-offset') || '0');
  const style = getComputedStyle(el);
  const padTop = Number.parseFloat(style.paddingTop) || 0;
  const content = el.offsetHeight - padTop - (Number.parseFloat(style.paddingBottom) || 0);
  const room = window.innerHeight - menu;
  return padTop - menu - Math.max(0, (room - content) / 2);
}

/** Scroll suave até um elemento (ou ao topo), com foco para quem usa teclado. */
export function scrollToTarget(target: HTMLElement | 'top') {
  const el = target === 'top' ? null : target;
  const top = el ? el.getBoundingClientRect().top + window.scrollY + landing(el) : 0;
  const done = () => el?.focus({ preventScroll: true });
  if (lenis) {
    // Vai a posição em píxeis e não o elemento: com um elemento, o Lenis desconta outra vez a
    // margem do menu (o scroll-padding-top do CSS) e a secção ficava 96 px abaixo do sítio.
    lenis.scrollTo(top, { duration: 1.2, onComplete: done });
    return;
  }
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

    // No painel (/admin) o scroll fica o do browser: há campos e listas com scroll próprio.
    // A pré-visualização (/admin/ver) é o site: leva o scroll suave como ele.
    const panel = () => window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith(PREVIEW_PATH);
    const wanted = () => !reduce.matches && !panel();
    gsap.ticker.lagSmoothing(0);
    if (wanted()) start();
    const onChange = () => {
      stop();
      if (wanted()) start();
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
