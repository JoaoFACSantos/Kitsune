import Image from 'next/image';
import Link from 'next/link';
import type { Giveaway } from '@/content/types';
import { Title } from '@/components/Title';
import { countdown, formatDay } from '@/lib/content/giveaways';

type GiveawaysProps = {
  title: string;
  intro: string;
  /** Só os que ainda estão a decorrer (a página já tirou os terminados). */
  items: Giveaway[];
  /** O dia de hoje em Lisboa, para a contagem ("faltam 5 dias"). */
  today: string;
  /** Onde está o regulamento (na pré-visualização do painel fica noutro endereço). */
  rulesHref?: string;
};

const GIFT =
  'M4.5 11.5h15V20h-15zM3 7.5h18v4H3zM12 7.5V20M12 7.5c-1.3-3.2-5.2-3.8-5.2-1.3 0 1.5 2.5 1.6 5.2 1.3Zm0 0c1.3-3.2 5.2-3.8 5.2-1.3 0 1.5-2.5 1.6-5.2 1.3Z';

function Gift({ strokeWidth = 2.2 }: { strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={GIFT} />
    </svg>
  );
}

/**
 * O cartão de um giveaway: o prémio, os passos para participar e o prazo. O painel também o usa
 * (components/admin/Live.tsx), para o mostrar ao lado dos campos enquanto se escreve.
 */
export function GiveawayCard({ item, today }: { item: Giveaway; today: string }) {
  return (
    <article className="giveaway glass">
      {/* Sem imagem do prémio, fica um presente desenhado: os cartões têm todos a mesma forma. */}
      {item.image && item.imageSize ? (
        <div className="giveaway-art">
          <Image src={item.image} alt="" width={item.imageSize.width} height={item.imageSize.height} sizes="(min-width: 900px) 520px, 100vw" />
        </div>
      ) : (
        <div className="giveaway-art" data-empty>
          <Gift strokeWidth={1.5} />
        </div>
      )}
      <div className="giveaway-body">
        <p className="giveaway-when">
          <Gift />
          {item.endsAt ? (
            <>
              <strong>{countdown(item.endsAt, today)}</strong>
              <span>até {formatDay(item.endsAt)}</span>
            </>
          ) : (
            <strong>a decorrer</strong>
          )}
        </p>
        <h3 className="giveaway-title">{item.title}</h3>
        {item.about ? <p className="giveaway-about">{item.about}</p> : null}
        {item.steps.length ? (
          <ol className="giveaway-steps" aria-label="Como participar">
            {item.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : null}
        {item.url ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary giveaway-cta">
            {item.cta}
            <span aria-hidden className="arrow">
              ↗
            </span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

/** Giveaways a decorrer: um cartão por prémio, com os passos para participar e o prazo. */
export function Giveaways({ title, intro, items, today, rulesHref = '/regulamento' }: GiveawaysProps) {
  return (
    <section id="giveaways" tabIndex={-1} aria-labelledby="giveaways-title" className="section">
      <div className="section-inner">
        <Title id="giveaways-title" text={title} />
        <p className="lead mt-5">{intro}</p>

        <ul className="giveaways mt-10 md:mt-14" data-count={Math.min(items.length, 3)} data-scroll="in" data-scroll-on=":scope > li" data-scroll-direct="24">
          {items.map((item, i) => (
            <li key={item.title} style={{ '--i': i } as React.CSSProperties}>
              <GiveawayCard item={item} today={today} />
            </li>
          ))}
        </ul>
        <p className="giveaways-foot">
          <Link href={rulesHref} prefetch={false}>
            Regulamento dos giveaways
          </Link>
        </p>
      </div>
    </section>
  );
}
