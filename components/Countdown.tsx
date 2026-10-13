'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

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

/** Recarrega a página para mostrar o site. Se ainda vier a página de abertura (uma cópia em cache), espera cada vez mais. */
function reload() {
  let tries = 0;
  try {
    tries = Number(sessionStorage.getItem(TRIES_KEY)) || 0;
    sessionStorage.setItem(TRIES_KEY, String(tries + 1));
  } catch {
    // Sem armazenamento: recarrega sempre com a mesma espera.
    tries = 1;
  }
  window.setTimeout(() => window.location.reload(), Math.min(tries * 2000, 10_000));
}

/**
 * A contagem decrescente da página de abertura. Quando chega a zero pergunta ao servidor se o
 * site já abriu (POST /api/abrir, que o abre se a hora já passou) e recarrega a página.
 */
export function Countdown({ opensAt }: { opensAt: string }) {
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
        if (state.open) return reload();
        // Fechado sem hora marcada (tiraram-na no painel): a página certa é o aviso de manutenção.
        if (!state.opensAt) return window.location.reload();
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
  }, [opening]);

  const units =
    left === null
      ? null
      : [
          { label: 'dias', value: Math.floor(left / 86_400) },
          { label: 'horas', value: Math.floor(left / 3600) % 24 },
          { label: 'min', value: Math.floor(left / 60) % 60 },
          { label: 'seg', value: left % 60 },
        ].filter((unit, i) => i > 0 || unit.value > 0);

  return (
    <>
      {/* Os leitores de ecrã não leem a contagem a cada segundo: a hora de abrir está na frase por cima. */}
      <div className="countdown" role="timer" aria-live="off" aria-label="Tempo que falta para o site abrir" data-opening={opening || undefined}>
        {(units ?? [{ label: 'horas' }, { label: 'min' }, { label: 'seg' }]).map((unit) => (
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
        {opening ? 'A abrir…' : ''}
      </p>
    </>
  );
}
