'use client';

import type { ClickStats } from '@/lib/clicks';
import { brandSlug } from '@/lib/content/editable';
import { formatDay } from '@/lib/day';
import { formatInt } from '@/lib/format';
import { useForm } from './form';

const clicks = (n: number) => `${formatInt(n)} ${n === 1 ? 'clique' : 'cliques'}`;

/**
 * Cliques nas parcerias: uma linha por marca, da mais clicada para a menos, nos últimos dias.
 * Uma cor só (é uma série). O número está escrito ao lado da barra; de onde vieram os cliques
 * aparece ao passar o rato ou com o foco do teclado.
 */
export function Clicks({ stats }: { stats: ClickStats }) {
  const { draft } = useForm();
  const rows = draft.partners.brands
    .map((brand) => {
      const slug = brandSlug(brand);
      const recent = stats.recent[slug] ?? { curto: 0, site: 0, links: 0 };
      return { slug, name: brand.name || 'Sem nome', ...recent, sum: recent.curto + recent.site + recent.links, total: stats.total[slug] ?? 0 };
    })
    .sort((a, b) => b.sum - a.sum);
  const top = Math.max(1, ...rows.map((row) => row.sum));

  return (
    <section className="admin-card glass">
      <header>
        <h2>Cliques nas parcerias</h2>
        <p>
          Quantas vezes cada marca foi aberta nos últimos {stats.days} dias: pelo link curto, pelo botão do cartão no site e pela página de links.
          {stats.since ? ` A contar desde ${formatDay(stats.since)}.` : null}
        </p>
      </header>
      {rows.length ? (
        <table className="bars">
          <caption className="sr-only">Cliques por parceria nos últimos {stats.days} dias</caption>
          <tbody>
            {rows.map((row) => (
              <tr key={row.slug} className="bar-row" tabIndex={0}>
                <th scope="row">
                  {row.name}
                  <small className="bar-note">/{row.slug}</small>
                </th>
                <td>
                  <span className="bar-line">
                    <span aria-hidden className="bar" style={{ '--v': row.sum / top } as React.CSSProperties} />
                    <span className="bar-value">{formatInt(row.sum)}</span>
                  </span>
                  <span className="bar-tip">
                    <strong>{clicks(row.sum)}</strong>
                    {row.sum ? `: ${formatInt(row.curto)} pelo link curto, ${formatInt(row.site)} no site, ${formatInt(row.links)} na página de links` : null}
                    <small>{row.total ? `desde o início: ${clicks(row.total)}` : 'ainda sem cliques contados'}</small>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="field-hint">Ainda não há parcerias. Os cliques aparecem aqui assim que houver.</p>
      )}
    </section>
  );
}
