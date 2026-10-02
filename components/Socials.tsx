'use client';

import { useRef } from 'react';
import type { Social, SocialId } from '@/content/types';
import { SocialIcon } from '@/components/icons';
import { Title } from '@/components/Title';
import { formatCompact } from '@/lib/format';
import { gsap, useGSAP } from '@/lib/gsap';
import { MEDIA } from '@/lib/motion';

// Cores das plataformas, escurecidas onde era preciso para texto branco com contraste AA.
const COLORS: Record<SocialId, string> = {
  twitch: '#9146FF',
  youtube: '#E6002E',
  tiktok: '#111111',
  instagram: 'linear-gradient(135deg, #833AB4, #C13584 55%, #E1306C)',
  x: '#111111',
  discord: '#5865F2',
  kick: '#1B7A2B',
};

// Como cada rede chama a quem a segue.
const COUNT_LABEL: Partial<Record<SocialId, string>> = { discord: 'membros', youtube: 'subscritores' };

type SocialsProps = { title: string; note: string; socials: Social[]; discordMembers: number };

/** Redes: cartões que enchem com a cor da plataforma a partir do ponto de entrada do rato. */
export function Socials({ title, note, socials, discordMembers }: SocialsProps) {
  const root = useRef<HTMLElement>(null);

  // Os números contam quando entram no ecrã.
  useGSAP(
    () => {
      if (window.matchMedia(MEDIA.reduce).matches) return;
      gsap.utils.toArray<HTMLElement>('[data-count]', root.current).forEach((el) => {
        const target = Number(el.dataset.count);
        const value = { n: 0 };
        el.textContent = formatCompact(0);
        gsap.to(value, {
          n: target,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: () => {
            el.textContent = formatCompact(value.n);
          },
        });
      });
    },
    { scope: root },
  );

  const setOrigin = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--x', `${event.clientX - r.left}px`);
    event.currentTarget.style.setProperty('--y', `${event.clientY - r.top}px`);
  };

  return (
    <section id="redes" ref={root} tabIndex={-1} aria-labelledby="redes-title" className="section">
      <div className="section-inner">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Title id="redes-title" text={title} />
          <p className="hand -rotate-3 text-3xl text-link">{note}</p>
        </div>

        <ul className="socials mt-10 md:mt-14">
          {socials.map((s) => {
            const count = s.id === 'discord' ? discordMembers : s.followers;
            return (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social glass"
                  style={{ '--c': COLORS[s.id] } as React.CSSProperties}
                  onPointerEnter={setOrigin}
                >
                  <span aria-hidden className="social-fill" />
                  <span className="social-icon">
                    <SocialIcon id={s.id} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="social-label">{s.label}</span>
                    <span className="social-meta truncate text-sm font-semibold">{s.handle}</span>
                  </span>
                  {count ? (
                    <span className="social-stat ml-auto text-right">
                      <span className="social-count block tabular-nums" data-count={count}>
                        {formatCompact(count)}
                      </span>
                      <span className="social-meta block text-xs font-bold uppercase tracking-wider">
                        {COUNT_LABEL[s.id] ?? 'seguidores'}
                      </span>
                    </span>
                  ) : null}
                  <span aria-hidden className="social-arrow">
                    ↗
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
