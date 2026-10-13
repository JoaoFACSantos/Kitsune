import { Doc } from '@/components/Doc';
import { formatDay } from '@/lib/day';
import type { ViewProps } from '@/lib/preview';

/**
 * O regulamento dos giveaways e a lista de quem já ganhou. As regras e os vencedores escrevem-se
 * no painel (/admin > Giveaways); as de origem estão em content/site.config.ts.
 */
export function RulesView({ site, base = '' }: ViewProps) {
  const { rules, winners } = site.giveaways;

  return (
    <Doc
      title="regulamento dos *giveaways*"
      lead={`As regras que valem para todos os giveaways da ${site.name}. O prémio, os passos para participar e o prazo estão no cartão de cada um.`}
      also={[{ href: `${base}/privacidade`, label: 'Privacidade' }]}
      home={base || '/'}
    >
      {rules.length ? (
        <ol className="doc-rules">
          {rules.map((rule) => (
            <li key={rule.title}>
              <h2>{rule.title}</h2>
              <p>{rule.text}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p>O regulamento ainda não foi escrito.</p>
      )}

      {winners.length ? (
        <section aria-labelledby="vencedores">
          <h2 id="vencedores" className="doc-heading">
            Quem já ganhou
          </h2>
          <ul className="doc-winners">
            {winners.map((winner, i) => (
              <li key={`${winner.name}-${i}`}>
                <strong>{winner.name}</strong>
                <span>{winner.prize}</span>
                {winner.date ? <time dateTime={winner.date}>{formatDay(winner.date)}</time> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Doc>
  );
}
