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
 * o resultado (ver "Escrita direta", mais abaixo). É para os efeitos com vários elementos.
 */

// ---- Escrita direta ----
// Mudar uma variável CSS num elemento obriga o browser a recalcular-lhe o estilo todo, regra a
// regra; mudar `translate`, `rotate`, `scale` ou `opacity` no próprio elemento custa menos de
// metade. No hero são 15 elementos por frame: com a variável, o scroll gastava ali perto de
// 3 ms só em estilos, e um ecrã de 240 Hz dá 4 ms a cada frame.
//
// O CSS continua a mandar: lê-se o que ele dá para vários valores da variável e, a cada frame,
// escreve-se o valor a meio caminho entre os dois mais próximos.
//
// - `data-scroll-direct` sem valor: para o que cresce em linha reta com a variável (a opacidade
//   pode parar no 0 ou no 1). Lê-se a 0, a 0,1 e a 1; um elemento em que a linha reta falhe fica
//   na variável, como antes.
// - `data-scroll-direct="24"`: para o resto (ondas, entradas em fila). Lê-se em 25 pontos, de 0 a
//   1, e vai-se em linha reta de um ponto ao seguinte. São muitas leituras: fazem-se com o
//   browser parado.
//
// Quem marca um elemento garante que os alvos só usam a variável nestas quatro propriedades (ou
// não a usam): a um alvo que não mexe em nenhuma delas, a variável deixa de ser escrita.

const DIRECT = ['translate', 'rotate', 'scale', 'opacity'] as const;
type DirectProp = (typeof DIRECT)[number];
/** `values` são os números lidos do CSS em pontos igualmente espaçados da variável, de 0 a 1. */
type Line = { prop: DirectProp; values: number[][]; last: string };
type Item = { el: HTMLElement | SVGElement; direct: boolean; lines: Line[] };

const STEP = 0.1;
/** Quanto tempo seguido se gasta, no máximo, a ler o CSS por pontos (ms). */
const SLICE_MS = 6;
/** Quanto o valor a 0,1 se pode afastar da linha reta (px, graus, escala, opacidade). */
const SLACK: Record<DirectProp, number> = { translate: 0.05, rotate: 0.01, scale: 0.001, opacity: 0.02 };
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

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
  return clamp01(v[0]).toFixed(3);
}

/** Com uma transição nestas propriedades, o que se lê do CSS vem atrasado: não serve. */
function inTransition(el: Element) {
  const style = getComputedStyle(el);
  const affected = style.transitionProperty.split(',').some((prop) => prop.trim() === 'all' || DIRECT.some((name) => name === prop.trim()));
  return affected && style.transitionDuration.split(',').some((time) => Number.parseFloat(time) > 0);
}

/** `segments`: em quantos troços se parte o caminho da variável (1 = uma linha reta só). */
function direct(targets: (HTMLElement | SVGElement)[], name: string, segments: number) {
  const items: Item[] = targets.map((el) => ({ el, direct: false, lines: [] }));
  const points = segments > 1 ? Array.from({ length: segments + 1 }, (_, k) => k / segments) : [0, STEP, 1];

  // A leitura do CSS, por onde passa cada propriedade de cada elemento, faz-se ponto a ponto:
  // `begin` prepara, cada `step` lê um ponto (e diz se ainda há mais) e `finish` fecha. Assim, a
  // leitura por pontos pode ser feita aos bocados, sem prender o browser de uma vez.
  let still: boolean[] = [];
  let readings: (number[] | null)[][][] = [];

  const begin = () => {
    // Tira o que aqui se escreveu, para se ler o que o CSS diz.
    for (const item of items) {
      for (const line of item.lines) item.el.style.removeProperty(line.prop);
      item.direct = false;
      item.lines = [];
    }
    still = items.map(({ el }) => !inTransition(el));
    readings = [];
  };

  const step = () => {
    const value = points[readings.length];
    for (const { el } of items) el.style.setProperty(name, String(value));
    readings.push(
      items.map(({ el }) => {
        const style = getComputedStyle(el);
        return DIRECT.map((prop) => read(prop, style.getPropertyValue(prop)));
      }),
    );
    return readings.length < points.length;
  };

  const finish = () => {
    items.forEach((item, i) => {
      item.direct =
        still[i] &&
        DIRECT.every((prop, j) => {
          const series = readings.map((reading) => reading[i][j]);
          if (series.some((numbers) => !numbers)) return false;
          let values = series as number[][];
          if (segments <= 1) {
            const [from, mid] = values;
            let to = values[2];
            // A opacidade pode bater no 0 ou no 1 a meio: a linha tira-se do início e corta-se ao escrever.
            if (prop === 'opacity') {
              const full = from[0] + (mid[0] - from[0]) / STEP;
              if (Math.abs(clamp01(full) - to[0]) > SLACK.opacity) return false;
              to = [full];
            }
            if (from.some((v, k) => Math.abs(mid[k] - (v + (to[k] - v) * STEP)) > SLACK[prop])) return false;
            values = [from, to];
          }
          const moves = values.some((numbers) => numbers.some((n, k) => Math.abs(n - values[0][k]) > SLACK[prop] / 10));
          if (moves) item.lines.push({ prop, values, last: '' });
          return true;
        });
      if (item.direct) item.el.style.removeProperty(name);
      else item.lines = [];
    });
  };

  /** A leitura toda de seguida. */
  const sample = () => {
    begin();
    while (step());
    finish();
  };

  const apply = (value: number) => {
    const text = value.toFixed(4);
    for (const item of items) {
      if (!item.direct) {
        item.el.style.setProperty(name, text);
        continue;
      }
      for (const line of item.lines) {
        // Entre que dois pontos lidos está o valor, e a que distância do primeiro.
        const at = clamp01(value) * (line.values.length - 1);
        const k = Math.min(line.values.length - 2, Math.floor(at));
        const from = line.values[k];
        const to = line.values[k + 1];
        const next = write(
          line.prop,
          from.map((v, c) => v + (to[c] - v) * (at - k)),
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

  return { sample, begin, step, finish, apply, clear };
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
      let reread = () => {};
      if (el.dataset.scrollDirect !== undefined) {
        const segments = Math.max(1, Math.round(Number(el.dataset.scrollDirect)) || 1);
        const candidate = direct(targets, name, segments);
        let entered = false;
        let waiting = 0;
        const start = () => {
          candidate.sample();
          writer = candidate;
          render();
        };
        // Uma linha reta são três leituras: fazem-se logo. Por pontos são dezenas: fazem-se com o
        // browser parado e aos bocados (uns milissegundos de cada vez). Até acabarem, o efeito anda
        // pela variável, como os outros.
        reread = () => {
          if (!entered || !alive) return;
          // Fora do ecrã de vez (a raposa, em ecrãs estreitos): não vale a pena ler nada, e a
          // variável num elemento que não se vê não custa.
          const shown = el.getClientRects().length > 0;
          if (segments === 1 && shown) return start();
          if (writer) {
            candidate.clear();
            writer = null;
            render();
          }
          if (!shown) {
            waiting++;
            return;
          }
          const turn = ++waiting;
          let began = false;
          const later = () => {
            if ('requestIdleCallback' in window) window.requestIdleCallback(run);
            else setTimeout(run, 200);
          };
          const run = (deadline?: IdleDeadline) => {
            if (!alive || turn !== waiting) return;
            if (!began) candidate.begin();
            began = true;
            const until = performance.now() + Math.min(deadline?.timeRemaining() ?? SLICE_MS, SLICE_MS);
            // Pelo menos um ponto por fatia, para a leitura andar sempre.
            let more = candidate.step();
            while (more && performance.now() < until) more = candidate.step();
            if (more) {
              // A leitura deixou a variável num valor de teste: repõe-se o do scroll até à próxima fatia.
              render();
              return later();
            }
            candidate.finish();
            writer = candidate;
            render();
          };
          later();
        };
        const entering = targets.flatMap((target) => target.getAnimations()).filter((animation) => Number.isFinite(Number(animation.effect?.getComputedTiming().endTime)));
        Promise.allSettled(entering.map((animation) => animation.finished)).then(() => {
          entered = true;
          reread();
        });
        // O estado de um elemento pode mudar a regra que se lhe aplica (a moldura do hero fica
        // quieta com o direto a passar): lê-se o CSS outra vez.
        const watcher = new MutationObserver(reread);
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
        reread();
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
    // 240 pontos: a cabeça dela abana muitas vezes ao longo da página (ver .scroll-fox-runner).
    <div ref={root} aria-hidden className="scroll-fox" data-scroll="page" data-scroll-on=".scroll-fox-bar, .scroll-fox-runner" data-scroll-direct="240">
      <span className="scroll-fox-bar" />
      <span className="scroll-fox-runner">
        <StickerArt kind="fox" className="h-full w-full" />
      </span>
    </div>
  );
}
