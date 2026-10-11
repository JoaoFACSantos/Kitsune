'use client';

import { useState } from 'react';
import { formatDay, formatDayShort, formatWeekday } from '@/lib/day';
import { formatInt } from '@/lib/format';
import type { VisitStats } from '@/lib/visits';

const people = (n: number) => `${formatInt(n)} ${n === 1 ? 'pessoa' : 'pessoas'}`;
const visits = (n: number) => `${formatInt(n)} ${n === 1 ? 'visita' : 'visitas'}`;

/** Um total: o nome do período, as pessoas (o número que conta) e, por baixo, as visitas. */
function Figure({ label, visitors, views }: { label: string; visitors: number; views: number }) {
  return (
    <div className="visit-figure">
      <p className="tile-label">{label}</p>
      <p className="tile-value">{formatInt(visitors)}</p>
      <p className="tile-sub">{visits(views)}</p>
    </div>
  );
}

/**
 * Visitas ao site: quatro totais e um gráfico de colunas com as pessoas de cada dia.
 * Uma cor só (é uma série) e sem legenda: o título do cartão já diz o que as colunas são.
 * Cada coluna dá o seu número ao passar o rato ou com o teclado (setas para andar de dia em dia).
 */
export function Visits({ stats }: { stats: VisitStats }) {
  const { days, total, since } = stats;
  const last = days.length - 1;
  // A coluna que recebe o foco do teclado: começa em hoje e anda com as setas.
  const [active, setActive] = useState(last);
  const sum = (list: typeof days) => list.reduce((acc, d) => ({ visitors: acc.visitors + d.visitors, views: acc.views + d.views }), { visitors: 0, views: 0 });
  const week = sum(days.slice(-7));
  const month = sum(days);
  const top = Math.max(1, ...days.map((d) => d.visitors));
  // O dia com mais gente leva o número escrito por cima (só esse: os outros dão-no ao passar o rato).
  const peak = month.visitors ? days.findIndex((d) => d.visitors === top) : -1;

  const onKey = (event: React.KeyboardEvent<HTMLOListElement>) => {
    const to = event.key === 'ArrowLeft' ? active - 1 : event.key === 'ArrowRight' ? active + 1 : event.key === 'Home' ? 0 : event.key === 'End' ? last : null;
    if (to === null || to < 0 || to > last) return;
    event.preventDefault();
    setActive(to);
    event.currentTarget.querySelectorAll<HTMLElement>('.col')[to]?.focus();
  };

  return (
    <section className="admin-card glass">
      <header>
        <h2>Visitas ao site</h2>
        <p>
          Pessoas que abriram o site. Cada pessoa conta uma vez por dia; as visitas contam todas as vezes que o site foi aberto.
          {since ? ` A contar desde ${formatDay(since)}.` : null}
        </p>
      </header>

      <div className="visit-figures">
        <Figure label="Hoje" visitors={days[last].visitors} views={days[last].views} />
        <Figure label="Últimos 7 dias" visitors={week.visitors} views={week.views} />
        <Figure label={`Últimos ${days.length} dias`} visitors={month.visitors} views={month.views} />
        <Figure label="Desde o início" visitors={total.visitors} views={total.views} />
      </div>

      {since ? (
        <figure className="visit-chart">
          <figcaption className="sr-only">Pessoas por dia nos últimos {days.length} dias. Usa as setas para andar de dia em dia.</figcaption>
          <ol className="cols" onKeyDown={onKey}>
            {days.map((d, i) => (
              <li
                key={d.day}
                className="col"
                tabIndex={i === active ? 0 : -1}
                data-side={i < 5 ? 'start' : i > last - 5 ? 'end' : undefined}
                data-empty={d.visitors ? undefined : true}
                style={{ '--v': d.visitors / top } as React.CSSProperties}
                aria-label={`${formatWeekday(d.day)}: ${people(d.visitors)}, ${visits(d.views)}`}
                onFocus={() => setActive(i)}
              >
                {i === peak ? (
                  <span aria-hidden className="col-label">
                    {formatInt(d.visitors)}
                  </span>
                ) : null}
                <span aria-hidden className="col-bar" />
                <span aria-hidden className="col-tip">
                  <strong>{people(d.visitors)}</strong> · {visits(d.views)}
                  <small>{i === last ? `hoje, ${formatDay(d.day)}` : formatWeekday(d.day)}</small>
                </span>
              </li>
            ))}
          </ol>
          <p aria-hidden className="cols-axis">
            <span>{formatDayShort(days[0].day)}</span>
            <span>{formatDayShort(days[Math.floor(last / 2)].day)}</span>
            <span>hoje</span>
          </p>
        </figure>
      ) : (
        <p className="field-hint">Ainda não há visitas contadas. O gráfico aparece assim que entrar a primeira pessoa.</p>
      )}
    </section>
  );
}
