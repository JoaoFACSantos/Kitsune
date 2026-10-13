import { VISIT_SKIP_KEY } from '@/components/VisitBeacon';

// Só corre no browser.

/**
 * Avisa o servidor de que o botão de uma parceria foi clicado no site, para a contagem do painel.
 * Sem cookies. Quem abre o painel neste browser não conta, como nas visitas.
 */
export function countClick(slug: string) {
  try {
    if (navigator.webdriver || localStorage.getItem(VISIT_SKIP_KEY)) return;
  } catch {
    // Sem acesso ao armazenamento (modo privado de alguns browsers): conta na mesma.
  }
  // keepalive: o pedido chega ao fim mesmo com a página a sair para o site da marca.
  fetch('/api/click', { method: 'POST', body: slug, keepalive: true }).catch(() => undefined);
}
