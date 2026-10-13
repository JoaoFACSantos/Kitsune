import { Doc } from '@/components/Doc';
import { brandSlug } from '@/lib/content/editable';
import type { ViewProps } from '@/lib/preview';

/**
 * O que o site guarda (quase nada) e o que não guarda, em linguagem de gente.
 * Quem mexer na contagem de visitas ou de cliques, nos players ou no alojamento tem de vir aqui
 * acertar o texto: tem de dizer o que o site faz mesmo (lib/visits.ts, lib/clicks.ts).
 */
export function PrivacyView({ site, base = '' }: ViewProps) {
  const host = new URL(site.url).host;
  // Um link curto a sério, para o exemplo: o da primeira parceria.
  const example = site.partners.brands[0] ? `${host}/${brandSlug(site.partners.brands[0])}` : null;

  return (
    <Doc
      title="a tua *privacidade*"
      lead="Este site não te segue, não tem publicidade e não pede conta. Guarda o mínimo para saber quanta gente o visita, e nada que diga quem és."
      updated="outubro de 2026"
      also={site.pages.rules && site.giveaways.active ? [{ href: `${base}/regulamento`, label: 'Regulamento dos giveaways' }] : []}
      home={base || '/'}
    >
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
          Quando abres uma parceria (pelo botão do cartão, por um link curto{example ? ` como ${example}` : ''}
          {site.pages.links ? ' ou pela página de links' : ''}), o site soma um ao total dessa
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
        <ul className="doc-list">
          {site.socials.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <p>Se achares que os teus dados foram mal tratados, podes também queixar-te à Comissão Nacional de Proteção de Dados (cnpd.pt).</p>
      </section>
    </Doc>
  );
}
