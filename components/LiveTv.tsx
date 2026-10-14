import { useEffect, useRef, useState } from 'react';
import { StickerArt } from '@/components/icons';
import { LivePill } from '@/components/LivePill';
import { useMessages } from '@/components/providers/Lang';

// Depois de a página parar, o browser atualiza o hover com um movimento de rato "falso":
// só passado este tempo é que um movimento conta como sendo da pessoa.
const SETTLE_MS = 250;

/**
 * A televisão que aparece na moldura do hero com o direto lá dentro: uma caixa retro com a
 * barra do estado em cima, o ecrã com os comandos ao lado e a base com a marca.
 *
 * A Twitch pausa o player se ele estiver rodado, com transform ativo ou com alguma coisa
 * por cima. Por isso a entrada da televisão e a estática são retiradas assim que acabam.
 */
export function LiveTv({ name, src, onClose }: { name: string; src: string; onClose: () => void }) {
  const m = useMessages().tv;
  const [entered, setEntered] = useState(false);
  const [staticDone, setStaticDone] = useState(false);
  const screen = useRef<HTMLDivElement>(null);

  // A roda do rato em cima de um iframe vai para o player, não para a página: o scroll suave
  // não a via e a página andava aos solavancos (e o cursor fica mesmo ali depois do play).
  // O player só recebe o rato quando ele se mexe em cima do ecrã; o scroll devolve-o à página.
  useEffect(() => {
    const el = screen.current;
    if (!el) return;
    let interactive = false;
    let scrolledAt = 0;
    const set = (next: boolean) => {
      if (next === interactive) return;
      interactive = next;
      el.dataset.interactive = String(next);
    };
    const onScroll = () => {
      scrolledAt = performance.now();
      set(false);
    };
    const onPointer = () => {
      if (performance.now() - scrolledAt > SETTLE_MS) set(true);
    };
    const onLeave = () => set(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('pointermove', onPointer);
    el.addEventListener('pointerdown', onPointer);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('scroll', onScroll);
      el.removeEventListener('pointermove', onPointer);
      el.removeEventListener('pointerdown', onPointer);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div
      className="tv"
      data-entered={entered}
      onAnimationEnd={(event) => {
        if (event.animationName === 'tv-in') setEntered(true);
        if (event.animationName === 'tv-on') setStaticDone(true);
      }}
    >
      <div className="tv-body">
        <div className="tv-top">
          <LivePill />
          <span aria-hidden className="tv-leds">
            <i />
            <i />
            <i />
          </span>
          <button type="button" className="tv-close" aria-label={m.close} onClick={onClose}>
            <span aria-hidden>✕</span>
          </button>
        </div>
        <div className="tv-main">
          <div className="tv-tube">
            <div ref={screen} className="tv-screen" data-interactive="false">
              <iframe src={src} title={m.title(name)} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
              {/* Chuva de estática enquanto a televisão "liga". */}
              {staticDone ? null : <span aria-hidden className="tv-static" />}
            </div>
          </div>
          <div aria-hidden className="tv-side">
            <span className="tv-dial" />
            <span className="tv-tag">CH</span>
            <span className="tv-knob" />
            <span className="tv-tag">VOL</span>
            <span className="tv-meter">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="tv-speaker" />
          </div>
        </div>
        <div aria-hidden className="tv-base">
          <span className="tv-vent" />
          <span className="tv-brand">
            <StickerArt kind="fox" />
            {name} TV
          </span>
          <span className="tv-power">ON</span>
        </div>
      </div>
      <span aria-hidden className="tv-foot tv-foot-l" />
      <span aria-hidden className="tv-foot tv-foot-r" />
    </div>
  );
}
