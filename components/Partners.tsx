'use client';

import { useRef, useState } from 'react';
import type { Brand, FunStat } from '@/content/types';
import { Magnetic } from '@/components/Magnetic';
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

/** Parcerias: marcas em fila infinita e um cartão para falar de trabalho. */
export function Partners({ title, intro, stats, brands, email, mailSubject }: PartnersProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
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

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = mailto;
    }
  };

  return (
    <section id="parcerias" tabIndex={-1} aria-labelledby="parcerias-title" className="section">
      <div className="section-inner">
        <p className="kicker">Parcerias</p>
        <p className="lead mt-3">Marcas com quem já criei conteúdo.</p>

        <div className="brands-marquee">
          {[0, 1].map((copyIndex) => (
            <ul key={copyIndex} className="brands-track" aria-hidden={copyIndex > 0} aria-label={copyIndex ? undefined : 'Marcas'}>
              {brands.map((brand) => (
                <li key={brand.name} className="brand glass">
                  {/* eslint-disable-next-line @next/next/no-img-element -- logos SVG pequenos, sem otimização */}
                  <img src={brand.logo} alt={copyIndex ? '' : brand.name} width={130} height={30} loading="lazy" />
                </li>
              ))}
            </ul>
          ))}
        </div>

        <div ref={cardRef} className="collab mt-12 md:mt-16">
          <span aria-hidden className="collab-blob" />
          <div className="relative grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Title id="parcerias-title" text={title} />
              <p className="mt-8 max-w-[46ch] text-lg text-white/90">{intro}</p>
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
              {stats.map((stat) => (
                <li key={stat.label} className="stat-pill">
                  <strong>{stat.value}</strong>
                  <span className="text-sm font-semibold text-white/90">{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p role="status" className="toast" data-show={copied}>
        {copied ? `${email} copiado ♡` : ''}
      </p>
    </section>
  );
}
