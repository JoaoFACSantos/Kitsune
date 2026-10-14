'use client';

import type { Social } from '@/content/types';
import { SocialIcon } from '@/components/icons';
import { useLang } from '@/components/providers/Lang';
import { formatCompact } from '@/lib/format';
import { messages } from '@/lib/i18n';
import { countLabel, SOCIAL_COLORS } from '@/lib/social-style';

type SocialCardProps = {
  social: Social;
  /** Seguidores, subscritores ou membros. Sem número (ou a zero), o cartão fica sem ele. */
  count?: number;
};

/**
 * O cartão de uma rede: enche com a cor da plataforma a partir do ponto por onde o rato entra.
 * É o da secção "Redes" do site (components/Socials.tsx) e o da página de links.
 */
export function SocialCard({ social, count }: SocialCardProps) {
  const lang = useLang();
  const setOrigin = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--x', `${event.clientX - r.left}px`);
    event.currentTarget.style.setProperty('--y', `${event.clientY - r.top}px`);
  };

  return (
    <a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      className="social glass"
      style={{ '--c': SOCIAL_COLORS[social.id] } as React.CSSProperties}
      onPointerEnter={setOrigin}
    >
      <span aria-hidden className="social-fill" />
      <span className="social-icon">
        <SocialIcon id={social.id} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="social-label">{social.label}</span>
        <span className="social-meta truncate text-sm font-semibold">{social.handle}</span>
      </span>
      {count ? (
        <span className="social-stat ml-auto text-right">
          {/* data-count: no site, o número conta até lá quando entra no ecrã (Socials.tsx). */}
          <span className="social-count block tabular-nums" data-count={count}>
            {formatCompact(count, lang)}
          </span>
          <span className="social-meta block text-xs font-bold uppercase tracking-wider">{countLabel(social.id, messages(lang))}</span>
        </span>
      ) : null}
      <span aria-hidden className="social-arrow">
        ↗
      </span>
    </a>
  );
}
