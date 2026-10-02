'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { Platform } from '@/content/types';
import { HeartShape, StickerArt, type StickerKind } from '@/components/icons';
import { LivePill } from '@/components/LivePill';
import { LivePlayer } from '@/components/LivePlayer';
import { Magnetic } from '@/components/Magnetic';
import { useLive } from '@/components/providers/Live';
import { gsap, useGSAP } from '@/lib/gsap';
import { FOLLOW, MEDIA } from '@/lib/motion';

type HeroProps = {
  name: string;
  greeting: string;
  role: string;
  tagline: string;
  photo: string;
  photoAlt: string;
  photoSize: { width: number; height: number };
  photoScale: number;
  photoOffsetY: number;
  note: string;
  watchUrl: string;
  platform: Platform;
  handle: string;
};

type StickerSpot = {
  kind: StickerKind;
  x: string;
  y: string;
  xm?: string;
  /** Posição com o direto na moldura (ecrã 16:9). */
  lx: string;
  ly: string;
  size: string;
  r: number;
  desktopOnly?: boolean;
  /** Fica ao lado do ecrã do direto: no telemóvel não há espaço, por isso esconde-se. */
  side?: boolean;
};

// Posições em % do palco (a moldura). xm = posição no telemóvel.
const STICKERS: StickerSpot[] = [
  { kind: 'heart', x: '-36%', y: '6%', xm: '-16%', lx: '-9%', ly: '8%', size: '30%', r: -12, side: true },
  { kind: 'star', x: '104%', y: '-8%', xm: '86%', lx: '7%', ly: '-13%', size: '24%', r: 10 },
  { kind: 'fox', x: '102%', y: '40%', lx: '94%', ly: '16%', size: '32%', r: 8, desktopOnly: true },
  { kind: 'gamepad', x: '-40%', y: '60%', xm: '-18%', lx: '-10%', ly: '46%', size: '32%', r: -8, side: true },
  { kind: 'paw', x: '84%', y: '84%', lx: '94%', ly: '52%', size: '25%', r: 14, desktopOnly: true },
];

// Corações em néon no fundo da moldura (posições em % da moldura).
const NEON_HEARTS = [
  { x: '5%', y: '17%', size: '12%', r: -14 },
  { x: '3%', y: '33%', size: '7%', r: 10 },
];

const HEARTS = 22;
const HEART_COLORS = ['var(--pink)', 'var(--pink-deep)', 'var(--lilac)', 'var(--butter)', 'var(--peach)'];

/** 01 · Hero: nome gigante, a foto a sair da moldura, stickers e corações. Em direto, a moldura mostra o direto. */
export function Hero({
  name,
  greeting,
  role,
  tagline,
  photo,
  photoAlt,
  photoSize,
  photoScale,
  photoOffsetY,
  note,
  watchUrl,
  platform,
  handle,
}: HeroProps) {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heartIndex = useRef(0);
  const [likes, setLikes] = useState(0);
  const status = useLive();
  const live = status.live;
  const letters = Array.from(name.toUpperCase());

  /** Um coração a voar: em rajada (clique) ou a subir como as reações de um direto. */
  const spawnHeart = (x: number, y: number, mode: 'burst' | 'stream', angle = 0) => {
    const hearts = stageRef.current?.querySelectorAll<HTMLElement>('.heart');
    if (!hearts?.length) return;
    const el = hearts[heartIndex.current % HEARTS];
    heartIndex.current += 1;
    el.style.color = HEART_COLORS[heartIndex.current % HEART_COLORS.length];
    if (mode === 'burst') {
      const distance = 70 + Math.random() * 70;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 50;
      el.animate(
        [
          { transform: `translate(${x}px, ${y}px) scale(0) rotate(0deg)`, opacity: 1 },
          { transform: `translate(${x + dx * 0.7}px, ${y + dy * 0.7}px) scale(1.25) rotate(${dx / 4}deg)`, opacity: 1, offset: 0.45 },
          { transform: `translate(${x + dx}px, ${y + dy - 30}px) scale(0.6) rotate(${dx / 3}deg)`, opacity: 0 },
        ],
        { duration: 900 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.2,1)' },
      );
      return;
    }
    const sway = (Math.random() - 0.5) * 50;
    el.animate(
      [
        { transform: `translate(${x}px, ${y}px) scale(0.2)`, opacity: 0 },
        { transform: `translate(${x + sway}px, ${y - 70}px) scale(1)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${x - sway}px, ${y - 160}px) scale(0.9)`, opacity: 0.9, offset: 0.65 },
        { transform: `translate(${x + sway / 2}px, ${y - 240}px) scale(0.7)`, opacity: 0 },
      ],
      { duration: 2200, easing: 'ease-out' },
    );
  };

  /** Clique na foto: rajada de corações, "boop" e mais um like. */
  const love = (event: React.MouseEvent<HTMLButtonElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    const fromKeyboard = event.detail === 0;
    const x = fromKeyboard ? r.width / 2 : event.clientX - r.left;
    const y = fromKeyboard ? r.height / 2 : event.clientY - r.top;
    const reduce = window.matchMedia(MEDIA.reduce).matches;
    const count = reduce ? 3 : 9;
    for (let i = 0; i < count; i++) spawnHeart(x, y, 'burst', (i / count) * Math.PI * 2 + Math.random() * 0.4);
    setLikes((n) => n + 1);
    if (!reduce) {
      gsap.fromTo(
        stage.querySelectorAll('.photo'),
        { scaleX: 1.07, scaleY: 0.9 },
        { scaleX: 1, scaleY: 1, duration: 0.9, ease: 'elastic.out(1, 0.4)', transformOrigin: '50% 100%', overwrite: 'auto' },
      );
    }
  };

  useGSAP(
    () => {
      const section = root.current;
      const stage = stageRef.current;
      if (!section || !stage) return;
      const reduce = window.matchMedia(MEDIA.reduce).matches;
      const fine = window.matchMedia(MEDIA.fine).matches;
      const photos = stage.querySelectorAll<HTMLElement>('.photo');
      gsap.set(photos, { xPercent: -50, x: 0 });

      // Stickers arrastáveis, com inércia e um abanão conforme a velocidade.
      // Os plugins carregam quando o browser está livre (ou ao primeiro toque num sticker).
      const cleanups: (() => void)[] = [];
      let cancelled = false;
      let draggables: { kill: () => void }[] = [];
      let loading = false;
      const enableDrag = async () => {
        if (loading) return;
        loading = true;
        const [{ Draggable }, { InertiaPlugin }] = await Promise.all([import('gsap/Draggable'), import('gsap/InertiaPlugin')]);
        if (cancelled) return;
        gsap.registerPlugin(Draggable, InertiaPlugin);
        draggables = Draggable.create(stage.querySelectorAll('.sticker'), {
          type: 'x,y',
          bounds: section,
          inertia: !reduce,
          zIndexBoost: true,
          cursor: 'var(--cursor-hover)',
          activeCursor: 'var(--cursor-grabbing)',
          onDrag() {
            gsap.to(this.target, { rotation: gsap.utils.clamp(-28, 28, this.deltaX * 3), duration: 0.3, overwrite: 'auto' });
          },
          onRelease() {
            gsap.to(this.target, { rotation: 0, duration: 1, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
          },
        });
      };
      const idle = window.setTimeout(enableDrag, 1500);
      const stickers = stage.querySelector('.stickers');
      stickers?.addEventListener('pointerover', enableDrag, { once: true });
      cleanups.push(() => {
        cancelled = true;
        window.clearTimeout(idle);
        stickers?.removeEventListener('pointerover', enableDrag);
        draggables.forEach((d) => d.kill());
      });

      if (reduce) return () => cleanups.forEach((fn) => fn());

      // Letras do nome: saltam ao passar o rato.
      section.querySelectorAll<HTMLElement>('.letter-inner').forEach((letter) => {
        const jump = () => {
          if (gsap.isTweening(letter)) return;
          gsap
            .timeline()
            .to(letter, { y: -26, scaleX: 0.86, scaleY: 1.14, duration: 0.14, ease: 'power2.out' })
            .to(letter, { y: 0, scaleX: 1, scaleY: 1, duration: 0.75, ease: 'elastic.out(1, 0.35)' });
        };
        letter.addEventListener('pointerenter', jump);
        cleanups.push(() => letter.removeEventListener('pointerenter', jump));
      });

      // Tilt 3D da moldura e parallax das camadas, a seguir o rato.
      if (fine) {
        const card = stage.querySelector('.card3d');
        const layers = {
          rx: gsap.quickTo(card, 'rotationX', { duration: FOLLOW.base, ease: FOLLOW.ease }),
          ry: gsap.quickTo(card, 'rotationY', { duration: FOLLOW.base, ease: FOLLOW.ease }),
          px: gsap.quickTo(photos, 'x', { duration: FOLLOW.base, ease: FOLLOW.ease }),
          py: gsap.quickTo(photos, 'y', { duration: FOLLOW.base, ease: FOLLOW.ease }),
          nx: gsap.quickTo(section.querySelector('.hero-name'), 'x', { duration: FOLLOW.slow, ease: FOLLOW.ease }),
        };
        gsap.set(card, { transformPerspective: 900 });
        const onMove = (event: PointerEvent) => {
          // Com o direto na moldura, o ecrã fica direito (um vídeo a abanar cansa).
          const k = stage.dataset.live === 'true' ? 0 : 1;
          const nx = event.clientX / window.innerWidth - 0.5;
          const ny = event.clientY / window.innerHeight - 0.5;
          layers.rx(-ny * 12 * k);
          layers.ry(nx * 16 * k);
          layers.px(nx * 18 * k);
          layers.py(ny * 10 * k);
          layers.nx(-nx * 28);
        };
        section.addEventListener('pointermove', onMove);
        cleanups.push(() => section.removeEventListener('pointermove', onMove));
      }

      // Reações a subir, como num direto (só com o hero visível).
      let visible = true;
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      observer.observe(stage);
      const timer = window.setInterval(() => {
        if (!visible || document.hidden) return;
        const r = stage.getBoundingClientRect();
        // Em direto sobem por fora, ao lado do ecrã, para não taparem o vídeo.
        const x = stage.dataset.live === 'true' ? r.width + 8 : r.width * 0.86;
        spawnHeart(x, r.height * 0.9, 'stream');
      }, 1100);
      cleanups.push(() => {
        observer.disconnect();
        window.clearInterval(timer);
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: root },
  );

  return (
    <section
      id="topo"
      ref={root}
      tabIndex={-1}
      aria-labelledby="hero-name"
      className="hero"
      data-scroll="out"
      style={{ '--chars': letters.length } as React.CSSProperties}
    >
      <p className="hero-greeting hand intro-rise" style={{ '--delay': '0.25s' } as React.CSSProperties}>
        {greeting}
        <svg viewBox="0 0 60 60" aria-hidden fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
          <path d="M6 10c20 0 36 12 38 34M36 38l8 8 8-10" />
        </svg>
      </p>

      <h1 id="hero-name" className="hero-name" aria-label={name}>
        {letters.map((char, i) => (
          <span
            key={i}
            aria-hidden
            className="letter intro-drop"
            // --o: distância ao centro do nome (com sinal); --a: a mesma distância sem sinal.
            style={{ '--i': i, '--o': i - (letters.length - 1) / 2, '--a': Math.abs(i - (letters.length - 1) / 2) } as React.CSSProperties}
          >
            <span className="letter-inner">{char === ' ' ? ' ' : char}</span>
          </span>
        ))}
      </h1>

      <div
        ref={stageRef}
        className="stage"
        data-live={live}
        style={{ '--photo-ratio': `${photoSize.width} / ${photoSize.height}` } as React.CSSProperties}
      >
        <div className="absolute inset-0 intro-zoom">
          <div className="stage-float">
            <div className="card3d">
              <div className="window">
                <span aria-hidden className="window-grid" />
                <span aria-hidden className="window-hearts">
                  {NEON_HEARTS.map((h, i) => (
                    <HeartShape key={i} className="neon-heart" style={{ '--x': h.x, '--y': h.y, '--s': h.size, '--r': `${h.r}deg`, '--d': `${i * -0.8}s` } as React.CSSProperties} />
                  ))}
                </span>
                <LivePlayer name={name} platform={platform} handle={handle} watchUrl={watchUrl} />
              </div>
              {/* A foto numa só camada, recortada à moldura e livre por cima: a cabeça "sai" do ecrã.
                  Em direto fica por trás do ecrã, a espreitar por cima. */}
              <div className="popout">
                <Image
                  src={photo}
                  alt={photoAlt}
                  width={photoSize.width}
                  height={photoSize.height}
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                  unoptimized={photo.endsWith('.svg')}
                  sizes="(min-width: 768px) 520px, 95vw"
                  className="photo"
                  style={{ '--photo-scale': photoScale, '--photo-y': photoOffsetY } as React.CSSProperties}
                  draggable={false}
                />
              </div>
              {live ? null : (
                <>
                  <p className="window-note hand">{note}</p>
                  <div className="window-bar">
                    <LivePill />
                    <span className="likes" aria-live="polite">
                      <HeartShape />
                      <span className="tabular-nums">{likes}</span>
                      <span className="sr-only">corações</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="window-hit"
                    aria-label={`Mandar um coração à ${name}`}
                    onClick={love}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <div aria-hidden className="hearts">
          {Array.from({ length: HEARTS }, (_, i) => (
            <span key={i} className="heart">
              <HeartShape className="h-full w-full" />
            </span>
          ))}
        </div>

        <div aria-hidden className="stickers">
          {STICKERS.map((s, i) => (
            <span
              key={s.kind}
              className={`sticker${s.desktopOnly ? ' hidden md:block' : ''}${s.side ? ' sticker-side' : ''}`}
              data-cursor
              style={
                {
                  '--x': s.x,
                  '--xm': s.xm ?? s.x,
                  '--y': s.y,
                  '--lx': s.lx,
                  '--ly': s.ly,
                  '--s': s.size,
                  '--r': `${s.r}deg`,
                  // Para onde o sticker voa quando o hero sai do ecrã: para fora e para cima.
                  '--fly-x': `${s.x.startsWith('-') ? -1 : 1}`,
                  '--fly-y': `${-(8 + i * 5)}vh`,
                } as React.CSSProperties
              }
            >
              <span className="block h-full w-full intro-pop" style={{ '--delay': `${0.9 + i * 0.08}s` } as React.CSSProperties}>
                <span className="sticker-pop">
                  <span className="sticker-wobble" style={{ '--d': `${i * -0.7}s` } as React.CSSProperties}>
                    <StickerArt kind={s.kind} className="h-full w-full" />
                  </span>
                </span>
              </span>
            </span>
          ))}
        </div>

        {live ? null : (
          <>
            <p aria-hidden className="hero-hint hero-hint-love hand intro-rise hidden lg:flex" style={{ '--delay': '1.7s' } as React.CSSProperties}>
              <span>
                clica na foto
                <br />
                para mandar ♡
              </span>
              <svg viewBox="0 0 60 40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M4 30c16 4 38 0 48-18M52 12l2 12M52 12l-11 3" />
              </svg>
            </p>

            <p aria-hidden className="hero-hint hand intro-rise hidden lg:flex" style={{ '--delay': '1.5s' } as React.CSSProperties}>
              <svg viewBox="0 0 60 40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M56 30C40 34 18 30 8 12M8 12l-2 12M8 12l11 3" />
              </svg>
              <span>
                arrasta os
                <br />
                stickers!
              </span>
            </p>
          </>
        )}
      </div>

      <p aria-hidden className="hero-tap hand intro-rise lg:hidden" style={{ '--delay': '1.3s' } as React.CSSProperties}>
        {live ? 'toca no ecrã para ver o direto' : 'toca na foto para mandar corações'}
      </p>

      <div className="hero-foot intro-rise" style={{ '--delay': '0.7s' } as React.CSSProperties}>
        <div>
          <p className="hero-role">{role}</p>
          <p className="hero-tagline">{tagline}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Magnetic>
            <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {live ? 'Ver em direto' : 'Ver na Twitch'}
              <span aria-hidden className="arrow">
                ↗
              </span>
            </a>
          </Magnetic>
          <Magnetic>
            <a href="#parcerias" className="btn btn-ghost">
              Parcerias
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
