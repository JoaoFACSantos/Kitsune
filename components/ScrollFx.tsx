'use client';

import { useRef } from 'react';
import { StickerArt } from '@/components/icons';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { MEDIA } from '@/lib/motion';

/**
 * Animações ligadas ao scroll. Cada elemento com `data-scroll` recebe variáveis CSS
 * com o progresso (0 a 1), e é o CSS que decide o que fazer com elas:
 *
 * - "in": `--in` sobe de 0 a 1 enquanto o elemento entra no ecrã;
 * - "through": `--p` vai de 0 a 1 enquanto o elemento atravessa o ecrã;
 * - "out": `--out` sobe de 0 a 1 enquanto o elemento sai por cima;
 * - "page": `--page` é o progresso da página inteira.
 *
 * As variáveis não passam para os filhos (ver os @property no CSS). Se forem os descendentes
 * a usar o valor, `data-scroll-on` diz quais, com um seletor: recebem-no também.
 *
 * O CSS usa as propriedades `translate`, `rotate` e `scale`, que não chocam com o
 * `transform` do GSAP nem com as animações de entrada. Sem JS ou com movimento
 * reduzido, as variáveis ficam no valor final e tudo aparece no sítio.
 *
 * Enquanto a animação decorre, o elemento tem também a classe `fx-in`, `fx-p` ou `fx-out`:
 * o CSS usa-a para dar camada própria (will-change) só ao que se está a mexer.
 */
export function ScrollFx() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia(MEDIA.reduce).matches) return;
    // Marca que as animações de scroll estão ativas (o CSS só mostra a raposa e a onda com isto).
    document.documentElement.classList.add('scroll-fx');
    const easeIn = gsap.parseEase('power3.out');
    const bind = (el: HTMLElement, name: string, vars: ScrollTrigger.Vars, ease?: (n: number) => number) => {
      const on = el.dataset.scrollOn;
      const targets = on ? [el, ...el.querySelectorAll<HTMLElement | SVGElement>(on)] : [el];
      const set = (self: ScrollTrigger) => {
        const value = (ease ? ease(self.progress) : self.progress).toFixed(4);
        for (const target of targets) target.style.setProperty(name, value);
      };
      ScrollTrigger.create({ ...vars, toggleClass: { targets: el, className: `fx${name.slice(1)}` }, onUpdate: set, onRefresh: set });
    };

    gsap.utils.toArray<HTMLElement>('[data-scroll]').forEach((el) => {
      const kinds = (el.dataset.scroll ?? '').split(' ');
      // "clamp" trava o fim no fundo da página, para as últimas secções chegarem sempre a 1.
      if (kinds.includes('in')) bind(el, '--in', { trigger: el, start: 'top 96%', end: 'clamp(top 52%)' }, easeIn);
      if (kinds.includes('through')) bind(el, '--p', { trigger: el, start: 'top bottom', end: 'bottom top' });
      if (kinds.includes('out')) bind(el, '--out', { trigger: el, start: 'top top', end: 'bottom top' });
      if (kinds.includes('page')) bind(el, '--page', { start: 0, end: 'max' });
    });
    return () => document.documentElement.classList.remove('scroll-fx');
  });

  // A raposa que corre ao lado da página e marca onde vais (só em ecrãs largos).
  return (
    <div ref={root} aria-hidden className="scroll-fox" data-scroll="page" data-scroll-on=".scroll-fox-runner">
      <span className="scroll-fox-runner">
        <StickerArt kind="fox" className="h-full w-full" />
      </span>
    </div>
  );
}
