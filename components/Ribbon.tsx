'use client';

import { useRef } from 'react';
import { SparkleShape } from '@/components/icons';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { MEDIA } from '@/lib/motion';

const BASE_SPEED = 55; // px/s

/** Duas fitas cruzadas com palavras; aceleram e mudam de sentido com o scroll. */
export function Ribbon({ words }: { words: string[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || window.matchMedia(MEDIA.reduce).matches) return;
      const tracks = gsap.utils.toArray<HTMLElement>('.tape-track', el);
      // Três cópias do texto: o loop volta atrás a largura de uma cópia, sem se ver a emenda.
      const groupWidth = (track: HTMLElement) => (track.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      const state = tracks.map((track, i) => ({ track, x: 0, width: groupWidth(track), sign: i % 2 ? -1 : 1 }));
      let direction = 1;
      let velocity = 0;
      let visible = false;

      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          visible = self.isActive;
        },
        onUpdate: (self) => {
          direction = self.direction;
          velocity = Math.abs(self.getVelocity());
        },
        onRefresh: () => {
          for (const s of state) s.width = groupWidth(s.track);
        },
      });

      const tick = (_time: number, deltaMs: number) => {
        if (!visible) return;
        const boost = Math.min(velocity / 220, 12);
        velocity *= 0.92;
        const dt = Math.min(deltaMs, 64) / 1000;
        for (const s of state) {
          s.x = gsap.utils.wrap(-s.width, 0, s.x - BASE_SPEED * (1 + boost) * direction * s.sign * dt);
          s.track.style.transform = `translate3d(${s.x}px, 0, 0)`;
        }
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: root },
  );

  const group = (key: number) => (
    <span key={key} className="tape-group" aria-hidden={key > 0}>
      {words.map((word) => (
        <span key={word} className="inline-flex items-center gap-[30px]">
          {word}
          <SparkleShape />
        </span>
      ))}
    </span>
  );

  return (
    <div ref={root} className="ribbons" aria-label={words.join(', ')} role="img">
      <div className="tape tape-a">
        <div className="tape-track">{[0, 1, 2].map(group)}</div>
      </div>
      <div className="tape tape-b">
        <div className="tape-track">{[0, 1, 2].map(group)}</div>
      </div>
    </div>
  );
}
