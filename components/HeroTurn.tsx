'use client';

import { useEffect, useRef } from 'react';
import { MEDIA } from '@/lib/motion';

type HeroTurnProps = {
  src: string;
  /** A televisão está ligada: o vídeo toca uma vez, do princípio. */
  playing: boolean;
  /** O ponto da imagem à vista no primeiro fotograma (o da imagem normal) e no último (o da imagem virada). */
  focusFrom?: string;
  focusTo?: string;
  /** Acabou (ou não pôde tocar): a partir daqui vale a imagem dela já virada. */
  onDone: () => void;
  className?: string;
};

/**
 * Ela a virar-se para a televisão: um vídeo curto, sem som, que começa na imagem normal e acaba na
 * imagem em que ela já está virada. Toca uma vez quando o direto abre e fica no último fotograma.
 * Com movimento reduzido, ou se o browser não o deixar tocar, não aparece: a imagem troca a esbater.
 */
export function HeroTurn({ src, playing, focusFrom, focusTo, onDone, className }: HeroTurnProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!playing) {
      video.pause();
      video.dataset.show = 'false';
      return;
    }
    if (window.matchMedia(MEDIA.reduce).matches) {
      onDone();
      return;
    }
    const show = () => {
      // O enquadramento desliza do da imagem normal para o da virada enquanto o vídeo toca.
      video.style.setProperty('--turn-s', `${Number.isFinite(video.duration) ? video.duration : 3}s`);
      video.dataset.show = 'true';
    };
    video.addEventListener('playing', show, { once: true });
    video.addEventListener('ended', onDone, { once: true });
    video.currentTime = 0;
    video.play().catch(onDone);
    return () => {
      video.removeEventListener('playing', show);
      video.removeEventListener('ended', onDone);
    };
  }, [playing, onDone]);

  return (
    <video
      ref={ref}
      aria-hidden
      tabIndex={-1}
      muted
      playsInline
      disablePictureInPicture
      preload="auto"
      src={src}
      className={className}
      style={{ '--focus-from': focusFrom, '--focus-to': focusTo } as React.CSSProperties}
      data-show="false"
    />
  );
}
