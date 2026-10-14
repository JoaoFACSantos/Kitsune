'use client';

import { useLang } from '@/components/providers/Lang';
import { useLive } from '@/components/providers/Live';
import { cn, formatInt } from '@/lib/format';
import { messages } from '@/lib/i18n';

/** "● EM DIRETO · 1 234" ou "Offline". Pequena (compact), fica "● DIRETO", sem o número. */
export function LivePill({ className, compact }: { className?: string; compact?: boolean }) {
  const status = useLive();
  const lang = useLang();
  const m = messages(lang).live;
  return (
    <span className={cn('live-pill', className)} data-live={status.live ? 'true' : 'false'}>
      <span aria-hidden className="live-dot" />
      {status.live ? (
        <>
          {compact ? m.short : m.on}
          {compact ? null : (
            <span className="tabular-nums">
              <span aria-hidden> · </span>
              {formatInt(status.viewers, lang)}
            </span>
          )}
        </>
      ) : (
        m.off
      )}
    </span>
  );
}
