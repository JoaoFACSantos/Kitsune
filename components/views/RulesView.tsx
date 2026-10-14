import { Doc } from '@/components/Doc';
import { localize } from '@/lib/content/localize';
import { formatDay } from '@/lib/day';
import { messages, routesFor } from '@/lib/i18n';
import type { ViewProps } from '@/lib/preview';

/**
 * O regulamento dos giveaways e a lista de quem já ganhou. As regras e os vencedores escrevem-se
 * no painel (/admin > Giveaways), com a versão inglesa; as de origem estão em content/site.config.ts.
 */
export function RulesView({ site: config, lang = 'pt', base = '' }: ViewProps) {
  const site = localize(config, lang);
  const m = messages(lang);
  const routes = routesFor(lang, base);
  const { rules, winners } = site.giveaways;

  return (
    <Doc
      title={m.rules.title}
      lead={m.rules.lead(site.name)}
      also={[{ href: routes.privacy, label: m.footer.privacy }]}
      home={routes.home}
      lang={lang}
      langHrefs={{ pt: routesFor('pt', base).rules, en: routesFor('en', base).rules }}
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
        <p>{m.rules.empty}</p>
      )}

      {winners.length ? (
        <section aria-labelledby="vencedores">
          <h2 id="vencedores" className="doc-heading">
            {m.rules.winners}
          </h2>
          <ul className="doc-winners">
            {winners.map((winner, i) => (
              <li key={`${winner.name}-${i}`}>
                <strong>{winner.name}</strong>
                <span>{winner.prize}</span>
                {winner.date ? <time dateTime={winner.date}>{formatDay(winner.date, lang)}</time> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Doc>
  );
}
