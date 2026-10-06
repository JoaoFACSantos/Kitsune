'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { Clip } from '@/content/types';
import { PlayIcon, StickerArt, type StickerKind } from '@/components/icons';
import { setScrollLocked } from '@/components/providers/SmoothScroll';
import { Title } from '@/components/Title';
import { clipEmbedUrl } from '@/lib/embed';
import { formatCompact, formatDate, formatDuration } from '@/lib/format';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { MEDIA } from '@/lib/motion';

type ClipsProps = { title: string; intro: string; moreUrl: string; clips: Clip[] };

// Capas desenhadas para os clips sem miniatura.
const COVERS: { kind: StickerKind; background: string }[] = [
  { kind: 'gg', background: 'linear-gradient(135deg, var(--pink), var(--lilac))' },
  { kind: 'paw', background: 'linear-gradient(135deg, var(--butter), var(--peach))' },
  { kind: 'heart', background: 'linear-gradient(135deg, var(--lilac), var(--mint))' },
  { kind: 'gamepad', background: 'linear-gradient(135deg, var(--peach), var(--pink))' },
];
const TILT = [-2.5, 1.5, -1.5, 2.5];

/** Clips: os melhores momentos em cartões tortos. Com player da plataforma, abrem num modal. */
export function Clips({ title, intro, moreUrl, clips }: ClipsProps) {
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState<{ clip: Clip; src: string } | null>(null);

  // Entrada em "pop" dos cartões quando a secção aparece.
  useGSAP(
    () => {
      if (window.matchMedia(MEDIA.reduce).matches) return;
      // Anima as células (li), não os cartões: o hover dos cartões usa transform em CSS.
      const cells = gsap.utils.toArray<HTMLElement>('.clip-cell', root.current);
      gsap.set(cells, { opacity: 0, y: 40, scale: 0.9 });
      ScrollTrigger.batch(cells, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.08, ease: 'back.out(1.7)', overwrite: true }),
      });
    },
    { scope: root },
  );

  const open = (clip: Clip, embedUrl: string) => {
    setPlaying({ clip, src: clipEmbedUrl(embedUrl, window.location.hostname) });
    dialog.current?.showModal();
    setScrollLocked(true);
  };

  const onClose = () => {
    setPlaying(null);
    setScrollLocked(false);
  };

  return (
    <section id="clips" ref={root} tabIndex={-1} aria-labelledby="clips-title" className="section">
      <div className="section-inner">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Title id="clips-title" text={title} />
            <p className="lead mt-5">{intro}</p>
          </div>
          <a href={moreUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            Ver todos os clips
            <span aria-hidden className="arrow">
              ↗
            </span>
          </a>
        </div>

        <ul className="clips mt-10 md:mt-14" aria-label="Clips" data-scroll="through" data-scroll-on=".clip-cell">
          {clips.map((clip, i) => {
            const cover = COVERS[i % COVERS.length];
            const style = { '--r': `${TILT[i % TILT.length]}deg` } as React.CSSProperties;
            const card = (
              <>
                <span className="clip-thumb" style={{ background: cover.background }}>
                  {clip.thumbnail ? (
                    <Image src={clip.thumbnail} alt="" fill sizes="(min-width: 1100px) 280px, (min-width: 640px) 45vw, 78vw" />
                  ) : (
                    <StickerArt kind={cover.kind} className="clip-art" />
                  )}
                  <span aria-hidden className="clip-play">
                    <PlayIcon />
                  </span>
                  <span className="clip-time">
                    <span className="sr-only">Duração: </span>
                    {formatDuration(clip.duration)}
                  </span>
                </span>
                <span className="clip-title">{clip.title}</span>
                <span className="clip-meta">
                  {formatCompact(clip.views)} visualizações · {formatDate(clip.createdAt)}
                </span>
              </>
            );
            const { embedUrl } = clip;
            return (
              <li key={clip.id} className="clip-cell">
                {embedUrl ? (
                  <button type="button" className="clip glass" style={style} onClick={() => open(clip, embedUrl)}>
                    {card}
                  </button>
                ) : (
                  <a href={clip.url} target="_blank" rel="noopener noreferrer" className="clip glass" style={style}>
                    {card}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <dialog
        ref={dialog}
        className="clip-dialog"
        aria-label={playing?.clip.title ?? 'Clip'}
        onClose={onClose}
        onClick={(event) => {
          // Clique fora da caixa (no fundo escuro) fecha.
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        {playing ? (
          <div className="clip-dialog-box">
            <iframe className="clip-frame" src={playing.src} title={playing.clip.title} allow="autoplay; fullscreen" allowFullScreen />
            <div className="clip-dialog-bar">
              <p className="clip-dialog-title">{playing.clip.title}</p>
              <a href={playing.clip.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                Abrir clip
                <span aria-hidden className="arrow">
                  ↗
                </span>
              </a>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => dialog.current?.close()}>
                Fechar
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
