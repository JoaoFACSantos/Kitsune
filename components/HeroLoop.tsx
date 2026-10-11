'use client';

import { useEffect, useRef } from 'react';
import { MEDIA } from '@/lib/motion';

// A arte do hero com vida: um vídeo curto, sem som e em loop (ela a pestanejar, a raposa também,
// o cabelo a mexer), por cima da imagem normal. Começa e acaba no mesmo fotograma, por isso
// repete sem salto. A imagem fica por baixo: com movimento reduzido, em poupança de dados ou se
// o browser não deixar o vídeo tocar sozinho, vê-se a imagem de sempre.

type Connection = { saveData?: boolean };

export function HeroLoop({ src, focus, className }: { src: string; focus?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia(MEDIA.reduce).matches) return;
    if ((navigator as Navigator & { connection?: Connection }).connection?.saveData) return;

    let visible = true;
    const sync = () => {
      if (visible && !document.hidden) video.play().catch(() => undefined);
      else video.pause();
    };
    // Só aparece quando está mesmo a tocar: até lá (ou se nunca tocar) fica a imagem.
    const onPlaying = () => {
      video.dataset.ready = 'true';
    };
    video.addEventListener('playing', onPlaying);

    // Só gasta bateria com o hero à vista.
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    document.addEventListener('visibilitychange', sync);

    // O vídeo só se pede depois de a página carregar, para não atrasar a imagem do topo.
    const start = () => {
      video.src = src;
      watcher.observe(video);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    return () => {
      window.removeEventListener('load', start);
      document.removeEventListener('visibilitychange', sync);
      video.removeEventListener('playing', onPlaying);
      watcher.disconnect();
      video.pause();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      aria-hidden
      tabIndex={-1}
      muted
      loop
      playsInline
      disablePictureInPicture
      preload="none"
      className={className}
      style={{ '--photo-focus': focus } as React.CSSProperties}
      data-ready="false"
    />
  );
}
