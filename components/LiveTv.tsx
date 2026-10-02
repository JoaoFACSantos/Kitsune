import { useState } from 'react';

/**
 * A televisão que aparece na moldura do hero com o direto lá dentro.
 *
 * A Twitch pausa o player se ele estiver rodado, com transform ativo ou com alguma coisa
 * por cima. Por isso a entrada da televisão e a estática são retiradas assim que acabam.
 */
export function LiveTv({ name, src, onClose }: { name: string; src: string; onClose: () => void }) {
  const [entered, setEntered] = useState(false);
  const [staticDone, setStaticDone] = useState(false);

  return (
    <div
      className="tv"
      data-entered={entered}
      onAnimationEnd={(event) => {
        if (event.animationName === 'tv-in') setEntered(true);
        if (event.animationName === 'tv-on') setStaticDone(true);
      }}
    >
      <span aria-hidden className="tv-antenna tv-antenna-l" />
      <span aria-hidden className="tv-antenna tv-antenna-r" />
      <div className="tv-body">
        <div className="tv-screen">
          <iframe src={src} title={`Direto de ${name}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
          {/* Chuva de estática enquanto a televisão "liga". */}
          {staticDone ? null : <span aria-hidden className="tv-static" />}
        </div>
        <div aria-hidden className="tv-side">
          <span className="tv-knob" />
          <span className="tv-knob" />
          <span className="tv-speaker" />
        </div>
      </div>
      <span aria-hidden className="tv-leg tv-leg-back" />
      <span aria-hidden className="tv-leg tv-leg-l" />
      <span aria-hidden className="tv-leg tv-leg-r" />
      <button type="button" className="tv-close" aria-label="Fechar o direto" onClick={onClose}>
        <span aria-hidden>✕</span>
      </button>
    </div>
  );
}
