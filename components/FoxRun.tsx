'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { StickerArt, type StickerKind } from '@/components/icons';

// O joguinho da página 404: a raposa corre e salta por cima do que lhe aparece à frente.
// Um toque (ou o espaço) faz tudo: começa, salta e recomeça.
// O que se mexe a cada frame é escrito direto nos elementos (transform), sem passar pelo React.

/** Onde a raposa está (px a contar da esquerda do palco) e quanto mede. Os mesmos do CSS. */
const FOX_X = 28;
const FOX = 60;
/** O salto: a gravidade (px/s²) e a velocidade com que ela sai do chão (px/s). Dá uns 140 px de altura. */
const GRAVITY = 2600;
const JUMP = 860;
/** A corrida: começa devagar e acelera um pouco a cada segundo, até um máximo (px/s). */
const SPEED = 300;
const SPEED_MAX = 640;
const SPEED_UP = 7;
/** O que aparece no caminho. Há um elemento de cada; reaproveitam-se à medida que saem do ecrã. */
const THINGS: StickerKind[] = ['gamepad', 'star', 'paw', 'gg'];
/** Folga nas colisões (px): tocar ao de leve num canto não conta. */
const SLACK = 13;
/** Tempo mínimo (ms) entre perder e recomeçar, para o toque do salto falhado não recomeçar logo. */
const RESTART_MS = 450;

type Phase = 'idle' | 'playing' | 'over';
type Thing = { x: number; size: number; live: boolean; passed: boolean };

// O recorde fica guardado no browser de quem joga.
const BEST_KEY = 'raposa:recorde';
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};
const saveBest = (score: number) => {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Sem acesso ao armazenamento (modo privado de alguns browsers): o recorde não fica guardado.
  }
  listeners.forEach((listener) => listener());
};

export function FoxRun() {
  const stageRef = useRef<HTMLButtonElement>(null);
  const foxRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const thingRefs = useRef<(HTMLSpanElement | null)[]>([]);
  /** O toque: começa, salta ou recomeça. Fica pronto quando o jogo é montado. */
  const press = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const best = useSyncExternalStore(subscribe, readBest, () => 0);

  useEffect(() => {
    const stage = stageRef.current;
    const fox = foxRef.current;
    if (!stage || !fox) return;
    const things: Thing[] = THINGS.map(() => ({ x: 0, size: 0, live: false, passed: false }));
    // `y` é a altura da raposa acima do chão (px); `gap` é o caminho que falta até aparecer a próxima coisa.
    const game = { phase: 'idle' as Phase, y: 0, vy: 0, speed: SPEED, gap: 0, score: 0, last: 0, endedAt: 0, raf: 0, width: stage.clientWidth };

    const drawFox = (tilt: number) => {
      fox.style.transform = `translate3d(0, ${(-game.y).toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg)`;
    };
    const drawThing = (i: number) => {
      const el = thingRefs.current[i];
      if (!el) return;
      const thing = things[i];
      el.style.visibility = thing.live ? 'visible' : 'hidden';
      if (!thing.live) return;
      el.style.width = el.style.height = `${thing.size}px`;
      el.style.transform = `translate3d(${thing.x.toFixed(1)}px, 0, 0)`;
    };
    const showScore = () => {
      if (scoreRef.current) scoreRef.current.textContent = String(game.score);
    };

    const end = () => {
      game.phase = 'over';
      game.endedAt = performance.now();
      cancelAnimationFrame(game.raf);
      drawFox(-24);
      if (game.score > readBest()) saveBest(game.score);
      setScore(game.score);
      setPhase('over');
    };

    const frame = (now: number) => {
      // Um separador que esteve parado não dá um salto no tempo: cada frame vale 34 ms no máximo.
      const dt = Math.min(0.034, (now - game.last) / 1000);
      game.last = now;
      game.speed = Math.min(SPEED_MAX, game.speed + SPEED_UP * dt);

      game.vy -= GRAVITY * dt;
      game.y = Math.max(0, game.y + game.vy * dt);
      if (game.y === 0) game.vy = 0;
      drawFox(Math.max(-16, Math.min(14, -game.vy / 45)));

      // A próxima coisa aparece à direita, a uma distância que dá sempre para saltar.
      game.gap -= game.speed * dt;
      if (game.gap <= 0) {
        const free = things.map((thing, i) => (thing.live ? -1 : i)).filter((i) => i >= 0);
        const i = free[Math.floor(Math.random() * free.length)];
        if (i !== undefined) things[i] = { x: game.width + 20, size: 38 + Math.round(Math.random() * 20), live: true, passed: false };
        game.gap = Math.max(250, game.speed * (0.8 + Math.random() * 0.95));
      }

      for (let i = 0; i < things.length; i++) {
        const thing = things[i];
        if (!thing.live) continue;
        thing.x -= game.speed * dt;
        if (thing.x < -thing.size) thing.live = false;
        else if (!thing.passed && thing.x + thing.size < FOX_X) {
          thing.passed = true;
          game.score++;
          showScore();
        }
        drawThing(i);
        const overlaps = thing.x + SLACK < FOX_X + FOX - SLACK && thing.x + thing.size - SLACK > FOX_X + SLACK;
        if (thing.live && overlaps && game.y < thing.size - SLACK) return end();
      }
      game.raf = requestAnimationFrame(frame);
    };

    const start = () => {
      things.forEach((thing, i) => {
        thing.live = false;
        drawThing(i);
      });
      Object.assign(game, { phase: 'playing', y: 0, vy: 0, speed: SPEED, gap: 320, score: 0, last: performance.now(), width: stage.clientWidth });
      showScore();
      drawFox(0);
      setPhase('playing');
      game.raf = requestAnimationFrame(frame);
    };

    press.current = () => {
      if (game.phase === 'playing') {
        if (game.y === 0) game.vy = JUMP;
      } else if (game.phase === 'idle' || performance.now() - game.endedAt > RESTART_MS) start();
    };

    // O espaço e a seta para cima saltam, a não ser que o foco esteja num link ou num botão.
    const onKey = (event: KeyboardEvent) => {
      if ((event.code !== 'Space' && event.code !== 'ArrowUp') || event.repeat) return;
      if (event.target !== document.body && event.target !== stage) return;
      event.preventDefault();
      press.current();
    };
    // Com o separador escondido o jogo pára; ao voltar, continua de onde estava.
    const onVisibility = () => {
      if (game.phase !== 'playing') return;
      cancelAnimationFrame(game.raf);
      if (!document.hidden) {
        game.last = performance.now();
        game.raf = requestAnimationFrame(frame);
      }
    };
    const resize = new ResizeObserver(() => {
      game.width = stage.clientWidth;
    });
    resize.observe(stage);
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(game.raf);
      resize.disconnect();
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="foxrun glass">
      <button
        ref={stageRef}
        type="button"
        className="foxrun-stage"
        data-phase={phase}
        aria-label="Jogo da raposa. Toca, clica ou carrega em espaço para ela saltar por cima do que aparece."
        onPointerDown={() => press.current()}
        // Um clique sem toque nem tecla (de um leitor de ecrã, por exemplo) também conta.
        onClick={(event) => {
          if (event.detail === 0) press.current();
        }}
        // O Enter com o foco no jogo: o espaço e a seta já são apanhados na janela.
        onKeyDown={(event) => {
          if (event.key !== 'Enter' || event.repeat) return;
          event.preventDefault();
          press.current();
        }}
      >
        <span aria-hidden className="foxrun-ground" />
        <span aria-hidden className="foxrun-score">
          <span ref={scoreRef}>0</span>
        </span>
        <span ref={foxRef} aria-hidden className="foxrun-fox">
          <StickerArt kind="fox" />
        </span>
        {THINGS.map((kind, i) => (
          <span
            key={kind}
            ref={(el) => {
              thingRefs.current[i] = el;
            }}
            aria-hidden
            className="foxrun-thing"
          >
            <StickerArt kind={kind} />
          </span>
        ))}
        <span className="foxrun-note" aria-live="polite">
          {phase === 'idle' ? (
            <>
              <strong>Ajuda a raposa a saltar</strong>
              <span>Toca, clica ou carrega em espaço</span>
            </>
          ) : phase === 'over' ? (
            <>
              <strong>
                {score} {score === 1 ? 'salto' : 'saltos'}
                {score > 0 && score >= best ? ' · novo recorde!' : ''}
              </strong>
              <span>{best > score ? `Recorde: ${best}. ` : ''}Toca para tentar outra vez</span>
            </>
          ) : null}
        </span>
      </button>
    </div>
  );
}
