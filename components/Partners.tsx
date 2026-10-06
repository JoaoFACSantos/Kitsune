'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { Brand, FunStat } from '@/content/types';
import { Magnetic } from '@/components/Magnetic';
import { setScrollLocked } from '@/components/providers/SmoothScroll';
import { Title } from '@/components/Title';
import { gsap, useGSAP } from '@/lib/gsap';
import { FOLLOW, MEDIA } from '@/lib/motion';

type PartnersProps = {
  title: string;
  intro: string;
  stats: FunStat[];
  brands: Brand[];
  email: string;
  mailSubject: string;
};

// Fila das marcas: segundos que uma volta completa demora, e píxeis a partir dos quais um toque conta como arrastar.
const MARQUEE_LOOP_S = 48;
const DRAG_START_PX = 6;

// O que aparece e desaparece dentro do cartão aberto, enquanto a caixa cresce ou encolhe.
const DETAILS = '.partner-art, .partner-body > *, .partner-close';

/** Parcerias: marcas em fila infinita (cada uma abre num cartão com o código) e um cartão para falar de trabalho. */
export function Partners({ title, intro, stats, brands, email, mailSubject }: PartnersProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  // O cartão da fila que foi clicado: a caixa cresce a partir dele e volta para ele.
  const originRef = useRef<HTMLElement | null>(null);
  const keyboardRef = useRef(false);
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState<Brand | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const mailto = `mailto:${email}?subject=${encodeURIComponent(mailSubject)}`;

  // Brilho que segue o cursor dentro do cartão.
  useGSAP(
    () => {
      const card = cardRef.current;
      const blob = card?.querySelector('.collab-blob');
      if (!card || !blob) return;
      gsap.set(blob, { x: card.offsetWidth * 0.85, y: card.offsetHeight * 0.2 });
      if (!window.matchMedia(MEDIA.fine).matches || window.matchMedia(MEDIA.reduce).matches) return;
      const xTo = gsap.quickTo(blob, 'x', { duration: FOLLOW.slow, ease: FOLLOW.ease });
      const yTo = gsap.quickTo(blob, 'y', { duration: FOLLOW.slow, ease: FOLLOW.ease });
      const onMove = (event: PointerEvent) => {
        const r = card.getBoundingClientRect();
        xTo(event.clientX - r.left);
        yTo(event.clientY - r.top);
      };
      card.addEventListener('pointermove', onMove);
      return () => card.removeEventListener('pointermove', onMove);
    },
    { scope: cardRef },
  );

  // A fila das marcas: anda sozinha, pára com o rato em cima e deixa-se arrastar, com balanço ao largar.
  // As duas cópias levam o mesmo desvio, sempre entre 0 e a largura de uma: nunca se vê o fim.
  useGSAP(
    () => {
      const el = marqueeRef.current;
      const tracks = el ? gsap.utils.toArray<HTMLElement>('.brands-track', el) : [];
      const first = tracks[0];
      // Com movimento reduzido a fila fica parada, arrumada em linhas pelo CSS.
      if (!el || !first || window.matchMedia(MEDIA.reduce).matches) return;

      let width = first.offsetWidth;
      const observer = new ResizeObserver(() => {
        width = first.offsetWidth;
      });
      observer.observe(first);

      let x = 0;
      // Balanço depois de largar (px/s); com ele a zero, a fila anda à velocidade normal.
      let velocity = 0;
      let hovering = false;
      let focused = false;
      let suppressClick = false;
      let drag: { id: number; startX: number; startOffset: number; lastX: number; lastT: number; moved: boolean } | null = null;

      const render = () => {
        if (width > 0) x = ((x % width) + width) % width;
        for (const track of tracks) track.style.transform = `translate3d(${-x}px, 0, 0)`;
      };

      const tick = (_time: number, deltaMs: number) => {
        if (drag?.moved) return;
        const dt = Math.min(deltaMs, 100) / 1000;
        if (velocity) {
          x += velocity * dt;
          velocity *= Math.exp(-dt * 4);
          if (Math.abs(velocity) < 8) velocity = 0;
        } else if (!hovering && !focused && el.dataset.paused !== 'true') {
          x += (width / MARQUEE_LOOP_S) * dt;
        } else {
          return;
        }
        render();
      };
      gsap.ticker.add(tick);

      const onDown = (event: PointerEvent) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        drag = { id: event.pointerId, startX: event.clientX, startOffset: x, lastX: event.clientX, lastT: event.timeStamp, moved: false };
      };
      const onMove = (event: PointerEvent) => {
        if (!drag || event.pointerId !== drag.id) return;
        const dx = event.clientX - drag.startX;
        if (!drag.moved) {
          // Só conta como arrastar depois de uns píxeis: abaixo disso é um clique no cartão.
          if (Math.abs(dx) < DRAG_START_PX) return;
          drag.moved = true;
          velocity = 0;
          el.setPointerCapture(event.pointerId);
          el.dataset.dragging = 'true';
        }
        const dt = event.timeStamp - drag.lastT;
        if (dt > 0) velocity = 0.7 * ((drag.lastX - event.clientX) / dt) * 1000 + 0.3 * velocity;
        drag.lastX = event.clientX;
        drag.lastT = event.timeStamp;
        x = drag.startOffset - dx;
        render();
      };
      const onUp = (event: PointerEvent) => {
        if (!drag || event.pointerId !== drag.id) return;
        if (drag.moved) {
          delete el.dataset.dragging;
          // Parou antes de largar: fica onde está, sem balanço.
          if (event.timeStamp - drag.lastT > 90) velocity = 0;
          // O clique que vem a seguir ao arrastar não abre o cartão.
          suppressClick = event.type === 'pointerup';
          window.setTimeout(() => {
            suppressClick = false;
          }, 80);
        }
        drag = null;
      };
      const onClick = (event: MouseEvent) => {
        if (!suppressClick) return;
        suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
      };
      const onEnter = (event: PointerEvent) => {
        if (event.pointerType === 'mouse') hovering = true;
      };
      const onLeave = () => {
        hovering = false;
      };
      // Com o teclado, a fila pára e traz o cartão focado para dentro do ecrã.
      const onFocusIn = (event: FocusEvent) => {
        const card = (event.target as Element).closest<HTMLElement>('.brand');
        if (!card?.matches(':focus-visible')) return;
        focused = true;
        velocity = 0;
        x = Math.max(0, card.getBoundingClientRect().left - first.getBoundingClientRect().left - 24);
        render();
        el.scrollLeft = 0;
      };
      const onFocusOut = () => {
        focused = false;
      };
      // O browser pode deslocar a caixa para mostrar o foco: o desvio é só o da fila.
      const onScroll = () => {
        if (el.scrollLeft) el.scrollLeft = 0;
      };

      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
      el.addEventListener('click', onClick, true);
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointerleave', onLeave);
      el.addEventListener('focusin', onFocusIn);
      el.addEventListener('focusout', onFocusOut);
      el.addEventListener('scroll', onScroll);
      return () => {
        gsap.ticker.remove(tick);
        observer.disconnect();
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
        el.removeEventListener('click', onClick, true);
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
        el.removeEventListener('focusin', onFocusIn);
        el.removeEventListener('focusout', onFocusOut);
        el.removeEventListener('scroll', onScroll);
      };
    },
    { scope: marqueeRef },
  );

  // Abre o cartão da marca: a caixa parte do sítio e do tamanho do cartão da fila e cresce até ao centro.
  useGSAP(
    () => {
      const dialog = dialogRef.current;
      const box = boxRef.current;
      if (!active || !dialog || !box || dialog.open) return;
      dialog.showModal();
      setScrollLocked(true);
      // O foco vai para o botão de fechar (e não para a caixa, que em ecrãs estreitos faz scroll).
      box.querySelector<HTMLElement>('.partner-close')?.focus({ preventScroll: true });
      const origin = originRef.current;
      if (!origin || window.matchMedia(MEDIA.reduce).matches) return;
      const from = origin.getBoundingClientRect();
      const to = box.getBoundingClientRect();
      origin.style.visibility = 'hidden';
      gsap.fromTo(
        box,
        { x: from.left - to.left, y: from.top - to.top, scaleX: from.width / to.width, scaleY: from.height / to.height },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.6, ease: 'expo.out', transformOrigin: '0 0', clearProps: 'transform' },
      );
      // O conteúdo só aparece com a caixa quase aberta: esticado, não se lia.
      gsap.fromTo(box.querySelectorAll(DETAILS), { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.16, stagger: 0.03, clearProps: 'opacity' });
    },
    { dependencies: [active] },
  );

  const openBrand = (brand: Brand, origin: HTMLElement, byKeyboard: boolean) => {
    originRef.current = origin;
    keyboardRef.current = byKeyboard;
    setCodeCopied(false);
    setActive(brand);
  };

  /** Fecha com a caixa a encolher de volta para o cartão da fila. */
  const closeBrand = () => {
    const dialog = dialogRef.current;
    const box = boxRef.current;
    const origin = originRef.current;
    if (!dialog?.open || dialog.dataset.closing) return;
    if (!box || !origin?.isConnected || window.matchMedia(MEDIA.reduce).matches) {
      dialog.close();
      return;
    }
    const from = box.getBoundingClientRect();
    const to = origin.getBoundingClientRect();
    dialog.dataset.closing = 'true';
    gsap.to(box.querySelectorAll(DETAILS), { opacity: 0, duration: 0.14, overwrite: true });
    gsap.to(box, {
      x: to.left - from.left,
      y: to.top - from.top,
      scaleX: to.width / from.width,
      scaleY: to.height / from.height,
      transformOrigin: '0 0',
      duration: 0.4,
      ease: 'power3.inOut',
      overwrite: true,
      onComplete: () => dialog.close(),
    });
  };

  const onDialogClose = () => {
    const origin = originRef.current;
    if (origin) {
      origin.style.visibility = '';
      // Aberto pelo teclado, o foco volta ao cartão. Com o rato não: a fila pára com o foco
      // do teclado num cartão, e fechar com Esc deixava-a parada (e a saltar para o início).
      if (keyboardRef.current) origin.focus({ preventScroll: true });
    }
    delete dialogRef.current?.dataset.closing;
    setActive(null);
    setScrollLocked(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = mailto;
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 2200);
    } catch {
      // Sem acesso à área de transferência: o código está escrito ao lado.
    }
  };

  return (
    <section id="parcerias" tabIndex={-1} aria-labelledby="parcerias-title" className="section">
      <div className="section-inner">
        <p className="kicker">Parcerias</p>
        <p className="lead mt-3">Marcas com quem trabalho. Clica numa para ver as vantagens e o código.</p>

        <div ref={marqueeRef} className="brands-marquee" data-paused={active !== null}>
          {[0, 1].map((copyIndex) => (
            <ul key={copyIndex} className="brands-track" aria-hidden={copyIndex > 0} aria-label={copyIndex ? undefined : 'Marcas'}>
              {brands.map((brand) => (
                <li key={brand.name}>
                  <button
                    type="button"
                    className="brand glass"
                    aria-haspopup="dialog"
                    // A segunda cópia só existe para a fila não ter fim: fica fora do teclado.
                    tabIndex={copyIndex ? -1 : undefined}
                    // detail a 0: o clique veio do teclado (Enter ou espaço).
                    onClick={(event) => openBrand(brand, event.currentTarget, event.detail === 0)}
                  >
                    <span className="brand-thumb" style={{ background: brand.color }}>
                      <Image src={brand.thumb ?? brand.image} alt="" fill sizes="96px" draggable={false} style={{ objectPosition: brand.focus }} />
                    </span>
                    <span className="brand-text">
                      <span className="brand-name">{brand.name}</span>
                      <span className="brand-category">{brand.category}</span>
                      <span className="brand-perk">{brand.perk}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ))}
        </div>

        <div ref={cardRef} className="collab mt-12 md:mt-16" data-scroll="in" data-scroll-on=".stat-pill">
          <span aria-hidden className="collab-blob" />
          <div className="relative grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Title id="parcerias-title" text={title} />
              <p className="mt-8 max-w-[28.75em] text-lg text-white/90">{intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Magnetic>
                  <a href={mailto} className="btn btn-white">
                    Enviar email
                    <span aria-hidden className="arrow">
                      ↗
                    </span>
                  </a>
                </Magnetic>
                <Magnetic>
                  <button type="button" className="btn btn-outline-white" onClick={copy}>
                    {copied ? 'Copiado ♡' : 'Copiar email'}
                  </button>
                </Magnetic>
              </div>
            </div>
            <ul className="grid content-end gap-3 lg:col-span-5">
              {stats.map((stat, i) => (
                <li key={stat.label} className="stat-pill" style={{ '--i': i } as React.CSSProperties}>
                  <strong>{stat.value}</strong>
                  <span className="text-sm font-semibold text-white/90">{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="partner-dialog"
        aria-labelledby="partner-name"
        onClose={onDialogClose}
        onCancel={(event) => {
          // Esc: fecha com a mesma animação.
          event.preventDefault();
          closeBrand();
        }}
        onClick={(event) => {
          // Clique fora da caixa (no fundo escuro) fecha.
          if (event.target === event.currentTarget) closeBrand();
        }}
      >
        {active ? (
          <div ref={boxRef} className="partner-box" data-lenis-prevent>
            <button type="button" className="partner-close" aria-label="Fechar" onClick={closeBrand}>
              <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <div
              className="partner-art"
              // Um banner ao alto enche a coluna; um deitado (um logo, por exemplo) fica inteiro.
              data-fit={active.imageSize.width > active.imageSize.height ? 'contain' : 'cover'}
              style={{ background: active.color }}
            >
              <Image
                src={active.image}
                alt={`Imagem da parceria com a ${active.name}`}
                fill
                sizes="(min-width: 760px) 340px, 100vw"
                style={{ objectPosition: active.focus }}
              />
            </div>
            <div className="partner-body" data-lenis-prevent>
              <p className="chip self-start">{active.category}</p>
              <h3 id="partner-name" className="partner-name">
                {active.name}
              </h3>
              <p className="partner-about">{active.about}</p>
              {active.perks.length ? (
                <ul className="partner-perks" aria-label="Vantagens">
                  {active.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
              ) : null}
              {active.code ? (
                <div className="partner-code">
                  <span className="flex min-w-0 flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">Código</span>
                    <strong className="truncate">{active.code}</strong>
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm ml-auto" onClick={() => copyCode(active.code ?? '')}>
                    {codeCopied ? 'Copiado ♡' : 'Copiar'}
                  </button>
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <a
                  href={active.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="btn btn-primary"
                  onClick={() => {
                    // Se o link não leva o código, vai copiado: é só colar no checkout.
                    if (active.code && !active.codeInLink) void copyCode(active.code);
                  }}
                >
                  {active.cta}
                  <span aria-hidden className="arrow">
                    ↗
                  </span>
                </a>
                {active.code ? (
                  <p className="text-sm font-semibold text-ink-soft">
                    {active.codeInLink ? 'O link já leva o código.' : 'O código fica copiado: cola-o no checkout.'}
                  </p>
                ) : null}
              </div>
              {active.note ? <p className="partner-note">{active.note}</p> : null}
            </div>
          </div>
        ) : null}
      </dialog>

      <p role="status" className="toast" data-show={copied}>
        {copied ? `${email} copiado ♡` : ''}
      </p>
    </section>
  );
}
