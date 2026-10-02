'use client';

import { useLive } from '@/components/providers/Live';
import { cn, formatInt } from '@/lib/format';

/** "● EM DIRETO · 1 234" ou "Offline". */
export function LivePill({ className, compact }: { className?: string; compact?: boolean }) {
  const status = useLive();
  return (
    <span className={cn('live-pill', className)} data-live={status.live ? 'true' : 'false'}>
      <span aria-hidden className="live-dot" />
      {status.live ? (
        <>
          Em direto
          {compact ? null : (
            <span className="tabular-nums">
              <span aria-hidden> · </span>
              {formatInt(status.viewers)}
            </span>
          )}
        </>
      ) : (
        'Offline'
      )}
    </span>
  );
}
