'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useMessages } from '@/components/providers/Lang';

// Quantas vezes este separador já recarregou à espera do site aberto (ver `reload`).
const TRIES_KEY = 'abertura:tentativas';

/** O relógio, ao segundo. No servidor não há relógio que sirva: fica null e a contagem aparece em branco. */
function subscribe(tick: () => void) {
  const id = window.setInterval(tick, 250);
  return () => window.clearInterval(id);
}
const seconds = () => Math.floor(Date.now() / 1000);
const none = () => null;

const pad = (value: number) => String(value).padStart(2, '0');

/** O que a página de abertura junta ao endereço para entrar no site (ver `enter`). */
export const OPEN_PARAM = 'aberto';

/**
 * Passa para o que o servidor tem agora: o site, se já abriu. Recarregar não chega: a página
 * pode vir de uma cópia em cache ainda com a contagem (a Cloudflare guarda uma em cada centro de
 * dados, durante um minuto ou mais). Por isso pede-se com "?aberto=…" no endereço, que é outra
 * entrada na cache, gerada na hora. O primeiro pedido leva a hora da abertura, igual para toda a
 * gente: gera-se uma vez e serve a todos. Se ainda assim vier a contagem, os seguintes levam
 * também um número ao acaso. Ao chegar, o endereço fica limpo (providers/SmoothScroll.tsx).
 */
function enter(opened: number) {
  let tries = 0;
  try {
    tries = Number(sessionStorage.getItem(TRIES_KEY)) || 0;
    sessionStorage.setItem(TRIES_KEY, String(tries + 1));
  } catch {
    // Sem armazenamento: vai sempre com um número ao acaso.
    tries = 1;
  }
  const stamp = Math.floor(opened / 1000);
  const url = new URL(window.location.href);
  url.searchParams.set(OPEN_PARAM, tries ? `${stamp}-${Math.random().toString(36).slice(2, 8)}` : String(stamp));
  window.setTimeout(() => window.location.replace(url.href), Math.min(tries * 1500, 8000));
}

/**
 * A contagem decrescente da página de abertura. Quando chega a zero pergunta ao servidor se o
 * site já abriu (POST /api/abrir, que o abre se a hora já passou) e recarrega a página.
 */
export function Countdown({ opensAt }: { opensAt: string }) {
  const m = useMessages().opening;
  const [target, setTarget] = useState(() => Date.parse(opensAt));
  // Quanto o relógio deste aparelho está atrasado em relação ao do servidor (ms). Só se fica a
  // saber quando se pergunta ao servidor; até lá, confia-se no do aparelho.
  const [skew, setSkew] = useState(0);
  const now = useSyncExternalStore(subscribe, seconds, none);
  const left = now === null ? null : Math.max(0, Math.ceil((target - skew) / 1000) - now);
  // Chegou a zero: está a abrir (ou a confirmar com o servidor que é mesmo agora).
  const opening = left === 0;
  const asking = useRef(false);

  // Uma contagem nova começa do zero: as tentativas de recarregar de uma abertura antiga já não contam.
  useEffect(() => {
    if (Date.parse(opensAt) <= Date.now()) return;
    try {
      sessionStorage.removeItem(TRIES_KEY);
    } catch {
      // Sem armazenamento: não há nada para limpar.
    }
  }, [opensAt]);

  useEffect(() => {
    if (!opening || asking.current) return;
    asking.current = true;
    let timer = 0;
    const ask = async () => {
      try {
        const response = await fetch('/api/abrir', { method: 'POST' });
        if (!response.ok) throw new Error(String(response.status));
        const state = (await response.json()) as { open: boolean; opensAt: string | null; now: number };
        // Aberto: entra-se no site. Fechado sem hora marcada (tiraram-na no painel): a página
        // certa é o aviso de manutenção. Num caso e no outro, vai-se buscar a página de agora.
        if (state.open || !state.opensAt) return enter(target);
        // Ainda não: o relógio daqui estava adiantado, ou a hora mudou no painel. Acerta-se e continua-se.
        try {
          sessionStorage.removeItem(TRIES_KEY);
        } catch {
          // Sem armazenamento: não há nada para limpar.
        }
        const next = Date.parse(state.opensAt);
        setSkew(state.now - Date.now());
        setTarget(next);
        timer = window.setTimeout(ask, Math.max(1000, next - state.now + 300));
      } catch {
        // Sem rede ou servidor ocupado: tenta outra vez daqui a pouco.
        timer = window.setTimeout(ask, 5000);
      }
    };
    // Um instante ao acaso antes de perguntar: quem está à espera não pergunta todo no mesmo segundo.
    timer = window.setTimeout(ask, Math.random() * 1200);
    return () => {
      window.clearTimeout(timer);
      asking.current = false;
    };
  }, [opening, target]);

  const units =
    left === null
      ? null
      : [
          { label: m.units.days, value: Math.floor(left / 86_400) },
          { label: m.units.hours, value: Math.floor(left / 3600) % 24 },
          { label: m.units.min, value: Math.floor(left / 60) % 60 },
          { label: m.units.sec, value: left % 60 },
        ].filter((unit, i) => i > 0 || unit.value > 0);

  return (
    <>
      {/* Os leitores de ecrã não leem a contagem a cada segundo: a hora de abrir está na frase por cima. */}
      <div className="countdown" role="timer" aria-live="off" aria-label={m.timer} data-opening={opening || undefined}>
        {(units ?? [{ label: m.units.hours }, { label: m.units.min }, { label: m.units.sec }]).map((unit) => (
          <span key={unit.label} className="countdown-unit glass">
            {'value' in unit ? (
              // A chave muda com o número: é o que faz o algarismo dar o salto ao mudar.
              <strong key={unit.value}>{pad(unit.value)}</strong>
            ) : (
              <strong aria-hidden>--</strong>
            )}
            <small>{unit.label}</small>
          </span>
        ))}
      </div>
      <p className="countdown-status" role="status">
        {opening ? m.busy : ''}
      </p>
    </>
  );
}
