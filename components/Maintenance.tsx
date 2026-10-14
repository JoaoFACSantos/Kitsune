import type { SiteConfig } from '@/content/types';
import { Countdown } from '@/components/Countdown';
import { LangSwitch } from '@/components/LangSwitch';
import { LangProvider } from '@/components/providers/Lang';
import { Title } from '@/components/Title';
import { SOCIAL_LABELS } from '@/lib/content/editable';
import { localize } from '@/lib/content/localize';
import { daysBetween, dayOf, formatDay, formatTime, today } from '@/lib/day';
import { type Lang, messages, routesFor } from '@/lib/i18n';

/** "hoje às 17:10", "amanhã às 09:00", "a 31 de outubro às 09:00" (pelo relógio de Lisboa; ou em inglês). */
function when(opensAt: string, lang: Lang) {
  const m = messages(lang).opening;
  const date = new Date(opensAt);
  const days = daysBetween(today(), dayOf(date));
  const day = days <= 0 ? m.today : days === 1 ? m.tomorrow : m.on(formatDay(dayOf(date), lang));
  return m.at(day, formatTime(date));
}

/**
 * O site fechado: em vez da página inteira, só o aviso, ao centro do ecrã.
 * Liga-se e desliga-se no painel (Definições), que continua a funcionar em /admin.
 * Com hora marcada para abrir (maintenance.opensAt), o aviso é a página de abertura: uma
 * contagem decrescente que, ao chegar a zero, abre o site sozinha (components/Countdown.tsx).
 */
export function Maintenance({ site: config, lang = 'pt' }: { site: SiteConfig; lang?: Lang }) {
  const site = localize(config, lang);
  const { title, opensAt, opening } = site.maintenance;
  const m = messages(lang).opening;
  const langs = <LangSwitch lang={lang} hrefs={{ pt: routesFor('pt').home, en: routesFor('en').home }} className="maintenance-lang" />;
  // Enquanto dura, os motores de busca não guardam esta página no lugar do site.
  const robots = <meta name="robots" content="noindex" />;

  if (!opensAt) {
    return (
      <main id="conteudo" tabIndex={-1} className="maintenance">
        {robots}
        {langs}
        <Title as="h1" text={title} />
      </main>
    );
  }

  const watch = site.socials.find((s) => s.id === site.platform);
  return (
    <LangProvider lang={lang} page>
      <main id="conteudo" tabIndex={-1} className="maintenance opening">
        {robots}
        {langs}
        <p className="kicker">{site.name}</p>
        <Title as="h1" text={opening.title} />
        <p className="lead">
          {m.opens(when(opensAt, lang))} {opening.text}
        </p>
        <Countdown opensAt={opensAt} />
        {watch ? (
          <a href={watch.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            {m.wait(SOCIAL_LABELS[site.platform])}
            <span aria-hidden className="arrow">
              ↗
            </span>
          </a>
        ) : null}
      </main>
    </LangProvider>
  );
}
