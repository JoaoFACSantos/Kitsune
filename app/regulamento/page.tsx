import type { Metadata } from 'next';
import { Doc } from '@/components/Doc';
import { Maintenance } from '@/components/Maintenance';
import { site as defaults } from '@/content/site.config';
import { getSite } from '@/lib/content/site';
import { formatDay } from '@/lib/day';

// O regulamento dos giveaways e a lista de quem já ganhou. As regras e os vencedores escrevem-se
// no painel (/admin > Giveaways); as de origem estão em content/site.config.ts.

export const metadata: Metadata = {
  title: 'Regulamento dos giveaways',
  description: `As regras dos giveaways da ${defaults.name}: quem pode participar, como se escolhe quem ganha e como chega o prémio.`,
  alternates: { canonical: '/regulamento' },
};

// O texto só muda quando se guarda no painel, e aí a página é gerada de novo.
export const revalidate = 3600;

export default async function RulesPage() {
  const site = await getSite();
  if (site.maintenance.active) return <Maintenance title={site.maintenance.title} />;
  const { rules, winners } = site.giveaways;

  return (
    <Doc
      title="regulamento dos *giveaways*"
      lead={`As regras que valem para todos os giveaways da ${site.name}. O prémio, os passos para participar e o prazo estão no cartão de cada um.`}
      also={[{ href: '/privacidade', label: 'Privacidade' }]}
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
