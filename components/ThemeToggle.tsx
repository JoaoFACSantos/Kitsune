'use client';

import { useRef, useSyncExternalStore } from 'react';
import { MoonIcon, SunIcon } from '@/components/icons';
import { MEDIA, THEME_KEY } from '@/lib/motion';

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
};
const isDark = () => document.documentElement.dataset.theme === 'dark';

/**
 * Switch claro/escuro. O tema vive no atributo data-theme do <html> (o CSS faz o resto)
 * e fica guardado no browser. A troca faz uma revelação circular rápida a partir do botão.
 */
export function ThemeToggle({ lightColor, darkColor }: { lightColor: string; darkColor: string }) {
  // No servidor conta como escuro: é o tema de origem.
  const dark = useSyncExternalStore(subscribe, isDark, () => true);
  // Com rato, a troca arranca logo ao carregar (pointerdown), sem esperar que o botão seja largado.
  const pressed = useRef(false);

  const toggle = (button: HTMLElement) => {
    const html = document.documentElement;
    const next = !isDark();
    const apply = () => {
      // Sem transições durante a troca: a página nova fica pronta no mesmo frame.
      html.classList.add('theme-swap');
      if (next) html.dataset.theme = 'dark';
      else delete html.dataset.theme;
      void html.offsetWidth; // aplica as cores novas já, ainda sem transições
      html.classList.remove('theme-swap');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next ? darkColor : lightColor);
      try {
        localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      } catch {}
    };

    const start = (document as Document & { startViewTransition?: Document['startViewTransition'] }).startViewTransition;
    if (!start || window.matchMedia(MEDIA.reduce).matches) {
      apply();
      return;
    }
    const r = button.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    start.call(document, apply).ready.then(
      () => {
        html.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
        );
      },
      // Cliques seguidos: o browser salta a transição anterior, não é um erro.
      () => {},
    );
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Modo escuro"
      className="theme-switch"
      onPointerDown={(event) => {
        pressed.current = event.pointerType === 'mouse' && event.button === 0;
        if (pressed.current) toggle(event.currentTarget);
      }}
      onClick={(event) => {
        // O rato já trocou no pointerdown; teclado e toque trocam aqui.
        if (pressed.current && event.detail > 0) {
          pressed.current = false;
          return;
        }
        toggle(event.currentTarget);
      }}
    >
      <span aria-hidden className="theme-stars">
        <i />
        <i />
        <i />
      </span>
      <span aria-hidden className="theme-knob">
        <SunIcon className="theme-sun" />
        <MoonIcon className="theme-moon" />
      </span>
    </button>
  );
}
