'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import type { FunStat, Gear, Spec } from '@/content/types';
import { GearGlyph } from '@/components/icons';
import { Title } from '@/components/Title';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { MEDIA } from '@/lib/motion';

type SetupProps = { title: string; intro: string; gear: Gear[]; pc: Spec[]; funStats: FunStat[] };

const TABS = [
  { id: 'gear', label: 'Periféricos' },
  { id: 'pc', label: 'O PC' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const STAT_COLORS = ['var(--butter)', 'var(--mint)', 'var(--lilac)', 'color-mix(in oklab, var(--pink) 45%, white)'];
const STAT_TILT = [-3, 2.5, -2, 3];

/** Setup: inventário de periféricos (clica para ver) e a ficha do PC. */
export function Setup({ title, intro, gear, pc, funStats }: SetupProps) {
  const root = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<TabId>('gear');
  const [selected, setSelected] = useState(0);
  const item = gear[selected];

  // Pílula escura que desliza para o separador ativo.
  useLayoutEffect(() => {
    const tabs = tabsRef.current;
    const place = () => {
      const active = tabs?.querySelector<HTMLElement>('[aria-selected="true"]');
      const glider = tabs?.querySelector<HTMLElement>('.tab-glider');
      if (!active || !glider) return;
      glider.style.width = `${active.offsetWidth}px`;
      glider.style.transform = `translateX(${active.offsetLeft}px)`;
    };
    place();
    document.fonts.ready.then(place);
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [tab]);

  // Entrada em "pop" dos cartões quando a secção aparece.
  useGSAP(
    () => {
      if (window.matchMedia(MEDIA.reduce).matches) return;
      // Anima as células (li), não os cartões: o hover dos cartões usa transform em CSS.
      const cards = gsap.utils.toArray<HTMLElement>('.gear-cell', root.current);
      gsap.set(cards, { opacity: 0, y: 40, scale: 0.85 });
      ScrollTrigger.batch(cards, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.06, ease: 'back.out(1.7)', overwrite: true }),
      });
    },
    { scope: root },
  );

  // Troca de item: o ícone salta e o texto sobe.
  useGSAP(
    () => {
      if (window.matchMedia(MEDIA.reduce).matches) return;
      if (tab === 'pc') {
        gsap.fromTo('.spec-row', { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power3.out' });
        gsap.fromTo('.fun-cell', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, stagger: 0.07, ease: 'back.out(2)' });
        return;
      }
      gsap.fromTo('.detail-icon-wrap', { scale: 0.5, rotation: -14 }, { scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
      gsap.fromTo('.detail-text > *', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' });
    },
    { scope: root, dependencies: [selected, tab] },
  );

  const onTabKey = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const next = tab === 'gear' ? 'pc' : 'gear';
    setTab(next);
    tabsRef.current?.querySelector<HTMLElement>(`#tab-${next}`)?.focus();
  };

  return (
    <section id="setup" ref={root} tabIndex={-1} aria-labelledby="setup-title" className="section">
      <div className="section-inner">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Title id="setup-title" text={title} />
            <p className="lead mt-5">{intro}</p>
          </div>
          <div ref={tabsRef} role="tablist" aria-label="Setup" className="tabs" onKeyDown={onTabKey}>
            <span aria-hidden className="tab-glider" />
            {TABS.map((t) => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                tabIndex={tab === t.id ? 0 : -1}
                className="tab"
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div id="panel-gear" role="tabpanel" aria-labelledby="tab-gear" hidden={tab !== 'gear'} className="mt-12 md:mt-16">
          <div className="grid gap-5 lg:grid-cols-12">
            <ul className="gear-grid lg:col-span-7" aria-label="Periféricos" data-scroll="through" data-scroll-on=".gear > svg">
              {gear.map((g, i) => (
                <li key={g.name} className="gear-cell" style={{ '--i': i } as React.CSSProperties}>
                  <button
                    type="button"
                    className="gear glass w-full"
                    aria-pressed={selected === i}
                    aria-controls="gear-detail"
                    onClick={() => setSelected(i)}
                  >
                    <GearGlyph icon={g.icon} />
                    <span className="gear-label">{g.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div id="gear-detail" aria-live="polite" className="detail glass lg:col-span-5">
              <span aria-hidden className="detail-blob" />
              <div className="detail-icon-wrap self-start">
                <GearGlyph icon={item.icon} className="detail-icon" />
              </div>
              <div className="detail-text relative flex flex-col gap-4">
                <p className="kicker">{item.label}</p>
                <p className="detail-name">{item.name}</p>
                <p className="lead">{item.note}</p>
                {item.tags?.length ? (
                  <ul className="flex flex-wrap gap-2" aria-label="Características">
                    {item.tags.map((tag) => (
                      <li key={tag} className="chip">
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div id="panel-pc" role="tabpanel" aria-labelledby="tab-pc" hidden={tab !== 'pc'} className="mt-12 md:mt-16">
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="glass rounded-[34px] p-6 md:p-10 lg:col-span-7">
              <p className="kicker">A máquina</p>
              <dl className="mt-4">
                {pc.map((spec) => (
                  <div key={spec.label} className="spec-row">
                    <dt className="text-ink-soft">{spec.label}</dt>
                    <dd className="text-right font-bold">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="lg:col-span-5">
              <p className="kicker mb-4">Estatísticas muito científicas</p>
              <ul className="grid grid-cols-2 gap-4">
                {funStats.map((stat, i) => (
                  <li key={stat.label} className="fun-cell">
                    <div
                      className="fun-stat"
                      style={{ background: STAT_COLORS[i % STAT_COLORS.length], '--r': `${STAT_TILT[i % STAT_TILT.length]}deg` } as React.CSSProperties}
                    >
                      <span className="fun-value">{stat.value}</span>
                      <span className="text-sm font-bold">{stat.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
