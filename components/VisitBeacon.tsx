'use client';

import { useEffect } from 'react';

/** Quem abre o painel neste browser deixa de contar como visita (ver components/admin/Editor.tsx). */
export const VISIT_SKIP_KEY = 'painel:nao-contar';

// Uma vez por página aberta (em desenvolvimento, o React corre os efeitos duas vezes).
let sent = false;

/** Avisa o servidor de que o site foi aberto, para a contagem de visitas do painel. Sem cookies. */
export function VisitBeacon() {
  useEffect(() => {
    // Browsers comandados por um programa (testes, robôs) não são visitas.
    if (sent || navigator.webdriver) return;
    try {
      if (localStorage.getItem(VISIT_SKIP_KEY)) return;
    } catch {
      // Sem acesso ao armazenamento (modo privado de alguns browsers): conta na mesma.
    }
    sent = true;
    // keepalive: o pedido chega ao fim mesmo que a pessoa saia logo.
    fetch('/api/visit', { method: 'POST', keepalive: true }).catch(() => undefined);
  }, []);
  return null;
}
