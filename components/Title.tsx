import { cn, splitEmphasis } from '@/lib/format';

/** Título com uma palavra em letra manuscrita ("o meu *setup*"). */
export function Title({ text, id, className, as: Tag = 'h2' }: { text: string; id?: string; className?: string; as?: 'h2' | 'h3' }) {
  const { before, em, after } = splitEmphasis(text);
  return (
    <Tag id={id} className={cn('title', className)}>
      {before}
      {em ? <span className="hand">{em}</span> : null}
      {after}
    </Tag>
  );
}
