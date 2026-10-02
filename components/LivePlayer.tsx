'use client';

import { useState } from 'react';
import type { Platform } from '@/content/types';
import { PlayIcon } from '@/components/icons';
import { LivePill } from '@/components/LivePill';
import { useLive } from '@/components/providers/Live';
import { liveEmbedUrl } from '@/lib/embed';
import { cn } from '@/lib/format';

type LivePlayerProps = { name: string; platform: Platform; handle: string; watchUrl: string };

/**
 * O direto dentro da moldura do hero. Começa por uma capa com "play": o player só carrega
 * quando alguém clica. Em ecrãs pequenos abre a plataforma, onde o player tem espaço.
 */
export function LivePlayer({ name, platform, handle, watchUrl }: LivePlayerProps) {
  const status = useLive();
  // Domínio do site, guardado no clique: a Twitch exige-o para deixar embutir.
  const [host, setHost] = useState<string | null>(null);
  if (!status.live) return null;

  const src = host ? liveEmbedUrl(platform, handle, host) : null;
  if (src) {
    return (
      <iframe
        className="live-frame"
        src={src}
        title={`Direto de ${name}`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  const canEmbed = liveEmbedUrl(platform, handle, '') !== null;
  const label = `Ver o direto: ${status.title}`;
  return (
    <div className="live-cover">
      {status.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element -- imagem do direto: muda a cada poucos minutos, sem cache do otimizador
        <img src={status.thumbnail} alt="" width={1280} height={720} />
      ) : null}
      <span aria-hidden className="live-shade" />
      <div className="window-bar">
        <LivePill />
        <span className="live-game">{status.category}</span>
      </div>
      <span aria-hidden className="live-play">
        <PlayIcon />
      </span>
      <p aria-hidden className="live-title">
        {status.title}
      </p>
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('live-hit', canEmbed && 'sm:hidden')}
        aria-label={label}
      />
      {canEmbed ? (
        <button
          type="button"
          className="live-hit hidden sm:block"
          aria-label={label}
          onClick={() => setHost(window.location.hostname)}
        />
      ) : null}
    </div>
  );
}
