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
 *
 * Com `data-scroll-direct`, o ScrollFx deixa de escrever a variável a cada frame e escreve logo
 * o resultado (ver `direct`, mais abaixo). É para os efeitos com muitos elementos, como o hero.
 */

// ---- Escrita direta ----
// Mudar uma variável CSS num elemento obriga o browser a recalcular-lhe o estilo todo, regra a
// regra; mudar `translate`, `rotate`, `scale` ou `opacity` no próprio elemento custa menos de
// metade. No hero são 15 elementos por frame: com a variável, o scroll gastava ali perto de
// 3 ms só em estilos, e um ecrã de 240 Hz dá 4 ms a cada frame (o resto da página gasta 1 ms).
//
// O CSS continua a mandar: lê-se o que ele dá com a variável a 0, a 0,1 e a 1, e a cada frame
// escreve-se o valor a meio caminho. Só serve para o que cresce em linha reta com a variável (a
// opacidade pode parar em 0 ou em 1); um elemento em que isso falhe fica na variável, como antes.

const DIRECT = ['translate', 'rotate', 'scale', 'opacity'] as const;
type DirectProp = (typeof DIRECT)[number];
type Line = { prop: DirectProp; from: number[]; to: number[]; last: string };
type Item = { el: HTMLElement | SVGElement; direct: boolean; lines: Line[] };

const STEP = 0.1;
/** Quanto o valor a 0,1 se pode afastar da linha reta (px, graus, escala, opacidade). */
const SLACK: Record<DirectProp, number> = { translate: 0.05, rotate: 0.01, scale: 0.001, opacity: 0.02 };

/** Os números de um valor calculado ("12px -30px", "7deg", "0.84", "none"), ou null se não for desses. */
function read(prop: DirectProp, value: string): number[] | null {
  const parts = value.trim() === 'none' || !value.trim() ? [] : value.trim().split(/\s+/);
  const numbers = parts.map(Number.parseFloat);
  if (numbers.some(Number.isNaN) || parts.length > 2) return null;
  if (prop === 'opacity') return parts.length === 1 ? numbers : null;
  if (prop === 'rotate') return parts.length === 0 ? [0] : parts.length === 1 && parts[0].endsWith('deg') ? numbers : null;
  if (prop === 'scale') return parts.length === 0 ? [1, 1] : [numbers[0], numbers[1] ?? numbers[0]];
  return parts.every((part) => part.endsWith('px')) ? [numbers[0] ?? 0, numbers[1] ?? 0] : null;
}

function write(prop: DirectProp, v: number[]) {
  if (prop === 'translate') return `${v[0].toFixed(2)}px ${v[1].toFixed(2)}px`;
  if (prop === 'rotate') return `${v[0].toFixed(3)}deg`;
  if (prop === 'scale') return `${v[0].toFixed(4)} ${v[1].toFixed(4)}`;
  return Math.min(1, Math.max(0, v[0])).toFixed(3);
}

function direct(targets: (HTMLElement | SVGElement)[], name: string) {
  const items: Item[] = targets.map((el) => ({ el, direct: false, lines: [] }));

  /** Lê do CSS de onde a onde vai cada propriedade de cada elemento. */
  const sample = () => {
    // Tira o que aqui se escreveu, para se ler o que o CSS diz.
    for (const item of items) {
      for (const line of item.lines) item.el.style.removeProperty(line.prop);
      item.lines = [];
    }
    const at = (value: number) => {
      for (const { el } of items) el.style.setProperty(name, String(value));
      return items.map(({ el }) => {
        const style = getComputedStyle(el);
        return DIRECT.map((prop) => read(prop, style.getPropertyValue(prop)));
      });
    };
    const start = at(0);
    const near = at(STEP);
    const end = at(1);
    items.forEach((item, i) => {
      item.direct = DIRECT.every((prop, j) => {
        const from = start[i][j];
        const mid = near[i][j];
        let to = end[i][j];
        if (!from || !mid || !to) return false;
        // A opacidade pode bater no 0 ou no 1 a meio: a linha tira-se do início e corta-se ao escrever.
        if (prop === 'opacity') {
          const full = from[0] + (mid[0] - from[0]) / STEP;
          if (Math.abs(Math.min(1, Math.max(0, full)) - to[0]) > SLACK.opacity) return false;
          to = [full];
        }
        if (from.some((v, k) => Math.abs(mid[k] - (v + (to[k] - v) * STEP)) > SLACK[prop])) return false;
        if (from.some((v, k) => Math.abs(to[k] - v) > SLACK[prop] / 10)) item.lines.push({ prop, from, to, last: '' });
        return true;
      });
      if (item.direct) item.el.style.removeProperty(name);
      else item.lines = [];
    });
  };

  const apply = (value: number) => {
    const text = value.toFixed(4);
    for (const item of items) {
      if (!item.direct) {
        item.el.style.setProperty(name, text);
        continue;
      }
      for (const line of item.lines) {
        const next = write(
          line.prop,
          line.from.map((v, k) => v + (line.to[k] - v) * value),
        );
        if (next === line.last) continue;
        line.last = next;
        item.el.style.setProperty(line.prop, next);
      }
    }
  };

  /** Volta tudo ao que o CSS diz, sem nada escrito à mão. */
  const clear = () => {
    for (const item of items) {
      for (const line of item.lines) item.el.style.removeProperty(line.prop);
      item.el.style.removeProperty(name);
      item.direct = false;
      item.lines = [];
    }
  };

  return { sample, apply, clear };
}

export function ScrollFx() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia(MEDIA.reduce).matches) return;
    // Marca que as animações de scroll estão ativas (o CSS só mostra a raposa e a onda com isto).
    document.documentElement.classList.add('scroll-fx');
    const easeIn = gsap.parseEase('power3.out');
    let alive = true;
    const cleanups: (() => void)[] = [];
    const bind = (el: HTMLElement, name: string, vars: ScrollTrigger.Vars, ease?: (n: number) => number) => {
      const on = el.dataset.scrollOn;
      const targets = on ? [el, ...el.querySelectorAll<HTMLElement | SVGElement>(on)] : [el];
      // O valor com que a página chega do servidor (o initial-value do @property, ou o do CSS).
      const initial = Number.parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0;
      // Se o JS arranca com o elemento já no ecrã (quem desce antes de a página acabar de
      // carregar), passar de repente do valor inicial para o do scroll via-se como um salto:
      // - uma entrada apanhada a meio fica no fim até o elemento sair do ecrã ou acabar de entrar;
      // - os outros efeitos vão do valor inicial ao do scroll em meio segundo.
      let first = true;
      let held = false;
      let current = initial;
      const mix = { k: 1 };
      let writer: ReturnType<typeof direct> | null = null;
      const render = () => {
        const number = held ? initial : initial + (current - initial) * mix.k;
        if (writer) return writer.apply(number);
        const value = number.toFixed(4);
        for (const target of targets) target.style.setProperty(name, value);
      };
      // Escrita direta (ver lá em cima). Só começa quando as animações de entrada acabam: enquanto
      // correm, o que se lê do CSS é o valor delas, e não o que a variável dá.
      if (el.dataset.scrollDirect !== undefined) {
        const candidate = direct(targets, name);
        const entering = targets.flatMap((target) => target.getAnimations()).filter((animation) => Number.isFinite(Number(animation.effect?.getComputedTiming().endTime)));
        Promise.allSettled(entering.map((animation) => animation.finished)).then(() => {
          if (!alive) return;
          candidate.sample();
          writer = candidate;
          render();
        });
        // O estado de um elemento pode mudar a regra que se lhe aplica (a moldura do hero fica
        // quieta com o direto a passar): lê-se o CSS outra vez.
        const watcher = new MutationObserver(() => {
          if (!writer) return;
          writer.sample();
          render();
        });
        for (const target of targets) watcher.observe(target, { attributes: true, attributeFilter: ['data-playing', 'data-live'] });
        cleanups.push(() => {
          watcher.disconnect();
          candidate.clear();
        });
      }
      const set = (self: ScrollTrigger) => {
        current = ease ? ease(self.progress) : self.progress;
        const partial = self.progress > 0 && self.progress < 1;
        if (first) {
          first = false;
          if (name === '--in' && initial === 1) held = partial;
          else if (Math.abs(current - initial) > 0.02 && ScrollTrigger.isInViewport(el)) {
            mix.k = 0;
            gsap.to(mix, { k: 1, duration: 0.5, ease: 'power2.out', onUpdate: render });
          }
        } else if (held && !partial) {
          held = false;
        }
        render();
      };
      // Ao refrescar (o ecrã mudou de tamanho, as fontes chegaram), o CSS pode dar outros valores.
      const refresh = (self: ScrollTrigger) => {
        writer?.sample();
        set(self);
      };
      ScrollTrigger.create({ ...vars, toggleClass: { targets: el, className: `fx${name.slice(1)}` }, onUpdate: set, onRefresh: refresh });
    };

    gsap.utils.toArray<HTMLElement>('[data-scroll]').forEach((el) => {
      const kinds = (el.dataset.scroll ?? '').split(' ');
      // "clamp" trava o fim no fundo da página, para as últimas secções chegarem sempre a 1.
      if (kinds.includes('in')) bind(el, '--in', { trigger: el, start: 'top 96%', end: 'clamp(top 52%)' }, easeIn);
      if (kinds.includes('through')) bind(el, '--p', { trigger: el, start: 'top bottom', end: 'bottom top' });
      if (kinds.includes('out')) bind(el, '--out', { trigger: el, start: 'top top', end: 'bottom top' });
      if (kinds.includes('page')) bind(el, '--page', { start: 0, end: 'max' });
    });
    return () => {
      alive = false;
      cleanups.forEach((fn) => fn());
      document.documentElement.classList.remove('scroll-fx');
    };
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
