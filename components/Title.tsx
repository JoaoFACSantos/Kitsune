import { cn, splitEmphasis } from '@/lib/format';

/** Título com uma palavra em letra manuscrita ("o meu *setup*"). */
export function Title({ text, id, className, as: Tag = 'h2' }: { text: string; id?: string; className?: string; as?: 'h2' | 'h3' }) {
  const { before, em, after } = splitEmphasis(text);
  return (
    <Tag id={id} className={cn('title', className)} data-scroll="in" data-scroll-on=".hand, .squiggle path">
      {before}
      {em ? (
        <span className="hand">
          {em}
          {/* Sublinhado ondulado, desenhado à medida que o título entra no ecrã. */}
          <svg aria-hidden className="squiggle" viewBox="0 0 120 12" preserveAspectRatio="none">
            <path pathLength={1} d="M2 7q10-7 20 0t20 0 20 0 20 0 20 0 16-1" />
          </svg>
        </span>
      ) : null}
      {after}
    </Tag>
  );
}
