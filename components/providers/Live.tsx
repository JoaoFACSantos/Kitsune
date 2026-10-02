'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { LiveStatus } from '@/lib/data/types';

const POLL_MS = 60_000;

const LiveContext = createContext<LiveStatus>({ live: false });

/** Estado do direto: vem do servidor e atualiza-se a cada 60 s enquanto a aba está visível. */
export function LiveProvider({ initial, children }: { initial: LiveStatus; children: React.ReactNode }) {
  const [status, setStatus] = useState(initial);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/live', { cache: 'no-store' });
        if (res.ok && alive) setStatus((await res.json()) as LiveStatus);
      } catch {
        // Sem rede: mantém o último estado conhecido.
      }
    };
    const timer = setInterval(poll, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return <LiveContext.Provider value={status}>{children}</LiveContext.Provider>;
}

export function useLive() {
  return useContext(LiveContext);
}
