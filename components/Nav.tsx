'use client';

import { useRef } from 'react';
import { LivePill } from '@/components/LivePill';
import { Magnetic } from '@/components/Magnetic';
import { ThemeToggle } from '@/components/ThemeToggle';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';

type NavProps = {
  name: string;
  watchUrl: string;
  links: { id: string; label: string }[];
  /** Cor da barra do browser em cada tema. */
  themeColors: { light: string; dark: string };
};

/** Nav em pílula: esconde ao descer, volta ao subir; o destaque desliza entre links. */
export function Nav({ name, watchUrl, links, themeColors }: NavProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      let hidden = false;
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const next = self.scroll() > 200 && self.direction === 1;
          if (next !== hidden) {
            hidden = next;
            el.dataset.hidden = String(next);
          }
        },
      });
    },
    { scope: ref },
  );

  // Pílula de destaque que desliza para o link debaixo do cursor.
  const moveGlider = (target: HTMLElement | null) => {
    const glider = ref.current?.querySelector<HTMLElement>('.nav-glider');
    if (!glider) return;
    if (!target) {
      gsap.to(glider, { opacity: 0, duration: 0.2, overwrite: 'auto' });
      return;
    }
    gsap.to(glider, {
      x: target.offsetLeft,
      width: target.offsetWidth,
      opacity: 1,
      duration: 0.3,
      ease: 'back.out(1.4)',
      overwrite: 'auto',
    });
  };

  return (
    <header ref={ref} className="nav" data-links={links.length}>
      <nav aria-label="Principal" className="nav-pill">
        <a href="#topo" className="nav-brand" aria-label={`${name}, voltar ao início`}>
          <span className="nav-name truncate">{name}</span>
        </a>

        <div className="nav-links" onPointerLeave={() => moveGlider(null)}>
          <span aria-hidden className="nav-glider" />
          <ul className="flex gap-0.5">
            {links.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} className="nav-link" onPointerEnter={(e) => moveGlider(e.currentTarget)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-actions">
          <ThemeToggle lightColor={themeColors.light} darkColor={themeColors.dark} />
          {/* O estado do direto é o link para o canal: clica-se na própria etiqueta. */}
          <Magnetic>
            <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="live-link" title="Abrir o canal">
              <LivePill compact />
              <span className="sr-only">: abrir o canal</span>
            </a>
          </Magnetic>
        </div>
      </nav>
    </header>
  );
}
