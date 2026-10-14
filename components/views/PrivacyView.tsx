import { Doc } from '@/components/Doc';
import type { SiteConfig } from '@/content/types';
import { brandSlug } from '@/lib/content/editable';
import { messages, routesFor } from '@/lib/i18n';
import type { ViewProps } from '@/lib/preview';

/**
 * O que o site guarda (quase nada) e o que não guarda, em linguagem de gente, em português e em
 * inglês. Quem mexer na contagem de visitas ou de cliques, nos players ou no alojamento tem de vir
 * aqui acertar os dois textos: têm de dizer o que o site faz mesmo (lib/visits.ts, lib/clicks.ts).
 */
export function PrivacyView({ site, lang = 'pt', base = '' }: ViewProps) {
  const m = messages(lang);
  const routes = routesFor(lang, base);
  const host = new URL(site.url).host;
  // Um link curto a sério, para o exemplo: o da primeira parceria.
  const example = site.partners.brands[0] ? `${host}/${brandSlug(site.partners.brands[0])}` : null;
  const english = lang === 'en';

  return (
    <Doc
      title={english ? 'your *privacy*' : 'a tua *privacidade*'}
      lead={
        english
          ? "This site doesn't track you, has no ads and doesn't ask you to sign up. It keeps the bare minimum to know how many people visit it, and nothing that says who you are."
          : 'Este site não te segue, não tem publicidade e não pede conta. Guarda o mínimo para saber quanta gente o visita, e nada que diga quem és.'
      }
      updated={english ? 'October 2026' : 'outubro de 2026'}
      also={site.pages.rules && site.giveaways.active ? [{ href: routes.rules, label: m.footer.rules }] : []}
      home={routes.home}
      lang={lang}
      langHrefs={{ pt: routesFor('pt', base).privacy, en: routesFor('en', base).privacy }}
    >
      {english ? <English site={site} example={example} /> : <Portuguese site={site} example={example} />}
    </Doc>
  );
}

type TextProps = { site: SiteConfig; example: string | null };

/** A lista das redes, para quem quiser falar com ela. */
function Socials({ site }: { site: SiteConfig }) {
  return (
    <ul className="doc-list">
      {site.socials.map((s) => (
        <li key={s.id}>
          <a href={s.url} target="_blank" rel="noopener noreferrer">
            {s.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Portuguese({ site, example }: TextProps) {
  return (
    <>
      <section>
        <h2 className="doc-heading">Visitas</h2>
        <p>
          Para saber quantas pessoas abrem o site, cada visita dá origem a um código curto, feito do dia, do teu endereço IP, do teu browser e de um
          segredo do site. O endereço IP não fica guardado e do código não se chega a ele. Os códigos apagam-se no dia seguinte: ficam só os totais de
          cada dia.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">Cliques nas parcerias</h2>
        <p>
          Quando abres uma parceria (pelo botão do cartão ou por um link curto{example ? ` como ${example}` : ''}), o site soma um ao total dessa
          marca nesse dia. Não fica registado quem clicou.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">Links de parceiros</h2>
        <p>
          Os links das parcerias são patrocinados ou de afiliada: se comprares por eles, a {site.name} pode receber uma comissão, sem custo para ti. A
          partir do momento em que sais para o site de uma marca, vale a política de privacidade dela.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">Vídeos e diretos</h2>
        <p>
          O player do direto e os clips só carregam quando clicas para os ver. A partir daí, a plataforma do vídeo pode guardar cookies e recolher dados
          teus, pelas regras dela. As miniaturas dos clips vêm dos servidores da Twitch, que recebem o pedido do teu browser como em qualquer imagem.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">O que fica no teu aparelho</h2>
        <p>
          A tua escolha entre o tema claro e o escuro fica guardada no teu browser e não sai dele. O site não usa cookies para quem o visita: o único
          cookie que existe é o de sessão do painel, e só o tem quem gere o site.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">Giveaways</h2>
        <p>
          Participas pelas redes indicadas em cada giveaway. A quem ganha pede-se uma morada, só para enviar o prémio, e ela é apagada a seguir. O nome
          de utilizador de quem ganha é publicado.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">Alojamento</h2>
        <p>
          O site está alojado na Cloudflare, que trata os pedidos técnicos (o teu endereço IP incluído) para o entregar e para o proteger de ataques.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">Os teus direitos</h2>
        <p>
          Podes pedir para saber, corrigir ou apagar os dados que existam sobre ti. Como o site não guarda nada que te identifique, na prática isto
          aplica-se a quem ganhou um giveaway. Fala com a {site.name} por mensagem numa das redes:
        </p>
        <Socials site={site} />
        <p>Se achares que os teus dados foram mal tratados, podes também queixar-te à Comissão Nacional de Proteção de Dados (cnpd.pt).</p>
      </section>
    </>
  );
}

function English({ site, example }: TextProps) {
  return (
    <>
      <section>
        <h2 className="doc-heading">Visits</h2>
        <p>
          To know how many people open the site, each visit produces a short code made from the day, your IP address, your browser and a secret kept by
          the site. Your IP address isn&apos;t stored and can&apos;t be worked out from the code. The codes are deleted the next day: only the daily totals
          remain.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">Clicks on partnerships</h2>
        <p>
          When you open a partnership (through the button on its card or a short link{example ? ` such as ${example}` : ''}), the site adds one to that
          brand&apos;s total for the day. Who clicked is not recorded.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">Partner links</h2>
        <p>
          Partnership links are sponsored or affiliate links: if you buy through them, {site.name} may earn a commission, at no cost to you. Once you
          leave for a brand&apos;s site, that brand&apos;s privacy policy applies.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">Videos and streams</h2>
        <p>
          The stream player and the clips only load when you click to watch them. From then on, the video platform may set cookies and collect data
          about you, under its own rules. Clip thumbnails come from Twitch&apos;s servers, which receive the request from your browser like any other
          image.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">What stays on your device</h2>
        <p>
          Your choice between the light and dark theme is saved in your browser and never leaves it. The site uses no cookies for visitors: the only
          cookie there is belongs to the admin panel, and only the people who run the site have it.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">Giveaways</h2>
        <p>
          You enter through the social networks listed in each giveaway. Winners are asked for a postal address, used only to send the prize and
          deleted afterwards. The winner&apos;s username is published.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">Hosting</h2>
        <p>
          The site is hosted by Cloudflare, which handles the technical requests (your IP address included) to deliver the site and protect it from
          attacks.
        </p>
      </section>

      <section>
        <h2 className="doc-heading">Your rights</h2>
        <p>
          You can ask to see, correct or delete any data about you. As the site keeps nothing that identifies you, in practice this applies to giveaway
          winners. Send {site.name} a message on one of her networks:
        </p>
        <Socials site={site} />
        <p>
          If you think your data was mishandled, you can also complain to the Portuguese data protection authority, the Comissão Nacional de Proteção de
          Dados (cnpd.pt).
        </p>
      </section>
    </>
  );
}
