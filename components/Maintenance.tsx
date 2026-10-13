import type { SiteConfig } from '@/content/types';
import { Countdown } from '@/components/Countdown';
import { Title } from '@/components/Title';
import { SOCIAL_LABELS } from '@/lib/content/editable';
import { daysBetween, dayOf, formatDay, formatTime, today } from '@/lib/day';

/** "hoje às 17:10", "amanhã às 09:00", "a 31 de outubro às 09:00" (pelo relógio de Lisboa). */
function when(opensAt: string) {
  const date = new Date(opensAt);
  const days = daysBetween(today(), dayOf(date));
  const day = days <= 0 ? 'hoje' : days === 1 ? 'amanhã' : `a ${formatDay(dayOf(date))}`;
  return `${day} às ${formatTime(date)}`;
}

/**
 * O site fechado: em vez da página inteira, só o aviso, ao centro do ecrã.
 * Liga-se e desliga-se no painel (Definições), que continua a funcionar em /admin.
 * Com hora marcada para abrir (maintenance.opensAt), o aviso é a página de abertura: uma
 * contagem decrescente que, ao chegar a zero, abre o site sozinha (components/Countdown.tsx).
 */
export function Maintenance({ site }: { site: SiteConfig }) {
  const { title, opensAt, opening } = site.maintenance;
  // Enquanto dura, os motores de busca não guardam esta página no lugar do site.
  const robots = <meta name="robots" content="noindex" />;

  if (!opensAt) {
    return (
      <main id="conteudo" tabIndex={-1} className="maintenance">
        {robots}
        <Title as="h1" text={title} />
      </main>
    );
  }

  const watch = site.socials.find((s) => s.id === site.platform);
  return (
    <main id="conteudo" tabIndex={-1} className="maintenance opening">
      {robots}
      <p className="kicker">{site.name}</p>
      <Title as="h1" text={opening.title} />
      <p className="lead">
        O site abre {when(opensAt)}. {opening.text}
      </p>
      <Countdown opensAt={opensAt} />
      {watch ? (
        <a href={watch.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
          Enquanto esperas: {SOCIAL_LABELS[site.platform]}
          <span aria-hidden className="arrow">
            ↗
          </span>
        </a>
      ) : null}
    </main>
  );
}
