'use client';

import { useRef } from 'react';
import type { Social } from '@/content/types';
import { SocialCard } from '@/components/SocialCard';
import { Title } from '@/components/Title';
import { formatCompact } from '@/lib/format';
import { gsap, useGSAP } from '@/lib/gsap';
import { isBelowFold, MEDIA } from '@/lib/motion';

type SocialsProps = { title: string; note: string; socials: Social[]; discordMembers: number };

/** Redes: um cartão por rede (components/SocialCard.tsx), com os números a contar quando entram no ecrã. */
export function Socials({ title, note, socials, discordMembers }: SocialsProps) {
  const root = useRef<HTMLElement>(null);

  // Os números contam quando entram no ecrã.
  useGSAP(
    () => {
      if (window.matchMedia(MEDIA.reduce).matches) return;
      gsap.utils.toArray<HTMLElement>('[data-count]', root.current).forEach((el) => {
        // Já à vista quando o JS arranca: fica com o número final, sem voltar a zero.
        if (!isBelowFold(el)) return;
        const target = Number(el.dataset.count);
        const value = { n: 0 };
        el.textContent = formatCompact(0);
        gsap.to(value, {
          n: target,
          duration: 3.2,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: () => {
            el.textContent = formatCompact(value.n);
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="redes" ref={root} tabIndex={-1} aria-labelledby="redes-title" className="section">
      <div className="section-inner">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Title id="redes-title" text={title} />
          <p className="hand -rotate-3 text-3xl text-link">{note}</p>
        </div>

        <ul className="socials mt-10 md:mt-14" data-scroll="in" data-scroll-on=":scope > li" data-scroll-direct="24">
          {socials.map((s, i) => (
            <li key={s.id} style={{ '--i': i } as React.CSSProperties}>
              <SocialCard social={s} count={s.id === 'discord' ? discordMembers : s.followers} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
