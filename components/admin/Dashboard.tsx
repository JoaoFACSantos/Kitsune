'use client';

import type { Clip, SocialId } from '@/content/types';
import { SocialIcon, StickerArt } from '@/components/icons';
import { LivePill } from '@/components/LivePill';
import { useLive } from '@/components/providers/Live';
import { formatCompact, formatDate, formatInt } from '@/lib/format';
import { useForm } from './form';
import { ArrowIcon, CheckIcon, InfoIcon, PlusIcon, WarnIcon } from './icons';

/** O que o servidor foi buscar para o resumo: números das APIs e os clips mais vistos. */
export type Overview = {
  /** Seguidores que chegaram das próprias redes (as que faltam usam o número escrito à mão). */
  followers: Partial<Record<SocialId, number>>;
  discordMembers: number;
  clips: Clip[];
};

export type Section = 'parcerias' | 'redes' | 'textos' | 'setup';

type DashboardProps = {
  name: string;
  overview: Overview;
  /** Há alterações por guardar. */
  dirty: boolean;
  /** Data da última gravação (ISO), ou null se o site está com o conteúdo de origem. */
  savedAt: string | null;
  /** Vai para uma secção; `open` abre lá um item (pelo índice) ou cria um novo. */
  go: (section: Section, open?: number | 'new') => void;
};

const and = new Intl.ListFormat('pt', { style: 'long', type: 'conjunction' });
const relative = new Intl.RelativeTimeFormat('pt', { numeric: 'auto' });

/** "há 2 horas", "ontem", "há 3 dias". */
function ago(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (Math.abs(minutes) < 1) return 'agora mesmo';
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute');
  if (Math.abs(minutes) < 60 * 24) return relative.format(Math.round(minutes / 60), 'hour');
  return relative.format(Math.round(minutes / (60 * 24)), 'day');
}

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

type Review = { level: 'warn' | 'info'; text: string; action?: { label: string; run: () => void } };

/** Um número com o seu nome e, por baixo, o que o explica. */
function Tile({ label, value, sub, hero }: { label: string; value: React.ReactNode; sub: React.ReactNode; hero?: boolean }) {
  return (
    <div className="tile glass" data-hero={hero ? true : undefined}>
      <p className="tile-label">{label}</p>
      <p className="tile-value">{value}</p>
      <p className="tile-sub">{sub}</p>
    </div>
  );
}

/** Início do painel: o estado do site num relance e atalhos para o que se mexe mais. */
export function Dashboard({ name, overview, dirty, savedAt, go }: DashboardProps) {
  const { draft } = useForm();
  const live = useLive();
  const brands = draft.partners.brands;

  // Cada rede com o número que o site mostra: o que chega da própria rede ou, sem isso, o escrito à mão.
  const networks = draft.socials
    .map((social) => {
      const discord = social.id === 'discord';
      const fetched = discord ? (draft.discord.invite ? overview.discordMembers : undefined) : overview.followers[social.id];
      return {
        id: social.id,
        label: social.label,
        unit: discord ? 'membros' : social.id === 'youtube' ? 'subscritores' : 'seguidores',
        value: fetched ?? (discord ? draft.discord.members : social.followers) ?? 0,
        auto: fetched !== undefined,
      };
    })
    .sort((a, b) => b.value - a.value);
  const followed = networks.filter((n) => n.id !== 'discord');
  const total = followed.reduce((sum, n) => sum + n.value, 0);
  const largest = Math.max(1, ...networks.map((n) => n.value));
  const discord = networks.find((n) => n.id === 'discord');

  const reviews: Review[] = [];
  const bare = brands.map((brand, index) => ({ brand, index })).filter(({ brand }) => brand.perks.length === 0);
  if (bare.length) {
    reviews.push({
      level: 'warn',
      text: `${capital(and.format(bare.map(({ brand }) => brand.name || 'uma parceria nova')))} ${bare.length === 1 ? 'não tem' : 'não têm'} vantagens escritas: quem abre o cartão não fica a saber o que ganha.`,
      action: { label: 'Escrever', run: () => go('parcerias', bare[0].index) },
    });
  }
  if (discord && !discord.auto) {
    reviews.push({
      level: 'warn',
      text: 'O link do Discord não é um convite (discord.gg/…): o número de membros não se atualiza sozinho.',
      action: { label: 'Ver', run: () => go('redes', draft.socials.findIndex((s) => s.id === 'discord')) },
    });
  }
  const manual = followed.filter((n) => !n.auto);
  if (manual.length) {
    reviews.push({
      level: 'info',
      text: `${and.format(manual.map((n) => n.label))} ${manual.length === 1 ? 'tem os seguidores escritos' : 'têm os seguidores escritos'} à mão. Atualiza-os de vez em quando.`,
      action: { label: 'Atualizar', run: () => go('redes') },
    });
  }
  if (!brands.length) reviews.push({ level: 'info', text: 'Ainda não há parcerias no site.', action: { label: 'Criar', run: () => go('parcerias', 'new') } });

  return (
    <div className="dash">
      <section className="dash-hello glass">
        <div className="dash-hello-text">
          <span aria-hidden className="dash-fox">
            <StickerArt kind="fox" />
          </span>
          <p className="hand dash-hand">olá,</p>
          <h2 className="dash-name">{name}</h2>
          <p className="dash-lead">
            {dirty
              ? 'Tens alterações por guardar. O site só muda quando carregares em «Guardar e publicar».'
              : savedAt
                ? 'O site está em dia com o que guardaste.'
                : 'O site está com o conteúdo de origem. Muda o que quiseres e guarda.'}
          </p>
          <div className="dash-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => go('parcerias', 'new')}>
              <PlusIcon />
              Nova parceria
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => go('redes')}>
              Atualizar seguidores
            </button>
          </div>
        </div>
        <div className="dash-live">
          <p className="tile-label">Direto</p>
          <LivePill />
          {live.live ? (
            <>
              <p className="dash-live-title">{live.title}</p>
              <p className="tile-sub">{live.category}</p>
            </>
          ) : (
            <p className="tile-sub">Quando entrares em direto na Twitch, o site mostra-o sozinho.</p>
          )}
        </div>
      </section>

      <div className="dash-tiles">
        <Tile hero label="Seguidores no total" value={formatCompact(total)} sub={`em ${followed.length} ${followed.length === 1 ? 'rede' : 'redes'}`} />
        <Tile
          label="Parcerias no site"
          value={brands.length}
          sub={brands.length ? `${brands.filter((b) => b.code).length} com código` : 'nenhuma por agora'}
        />
        <Tile
          label="Membros no Discord"
          value={discord ? formatCompact(discord.value) : '–'}
          sub={discord ? (discord.auto ? 'contados pelo convite' : 'valor escrito à mão') : 'o Discord não está nas redes'}
        />
        <Tile
          label="Última gravação"
          value={savedAt ? <span suppressHydrationWarning>{ago(savedAt)}</span> : 'nunca'}
          sub={savedAt ? formatDate(savedAt) : 'conteúdo de origem'}
        />
      </div>

      <div className="dash-grid">
        <section className="admin-card glass">
          <header>
            <h2>Comunidade por rede</h2>
            <p>Seguidores, subscritores e membros, da maior para a mais pequena.</p>
          </header>
          {/* O gráfico é uma tabela: cada linha tem o nome e o número por extenso, a barra só ajuda a comparar. */}
          <table className="bars">
            <caption className="sr-only">Comunidade por rede</caption>
            <tbody>
              {networks.map((n) => (
                <tr key={n.id} className="bar-row" tabIndex={0}>
                  <th scope="row">
                    <span className="bar-icon">
                      <SocialIcon id={n.id} />
                    </span>
                    {n.label}
                  </th>
                  <td>
                    <span className="bar-line">
                      <span aria-hidden className="bar" style={{ '--v': n.value / largest } as React.CSSProperties} />
                      <span className="bar-value">{formatCompact(n.value)}</span>
                    </span>
                    <span className="bar-tip">
                      <strong>{formatInt(n.value)}</strong> {n.unit}
                      <small>{n.auto ? 'número que chega da própria rede' : 'número escrito à mão, no separador Redes'}</small>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="admin-card glass">
          <header>
            <h2>A rever</h2>
            <p>O que vale a pena espreitar.</p>
          </header>
          {reviews.length ? (
            <ul className="reviews">
              {reviews.map((review) => (
                <li key={review.text} data-level={review.level}>
                  <span className="review-icon">{review.level === 'warn' ? <WarnIcon /> : <InfoIcon />}</span>
                  <p>
                    <span className="sr-only">{review.level === 'warn' ? 'Atenção: ' : 'Sugestão: '}</span>
                    {review.text}
                  </p>
                  {review.action ? (
                    <button type="button" className="review-action" onClick={review.action.run}>
                      {review.action.label}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="reviews-clear">
              <span className="review-icon">
                <CheckIcon />
              </span>
              Tudo em ordem. Não há nada por rever.
            </p>
          )}
        </section>

        <section className="admin-card glass">
          <header>
            <h2>Parcerias</h2>
            <p>Pela ordem em que passam no site. Clica numa para a editar.</p>
          </header>
          {brands.length ? (
            <ul className="rows">
              {brands.map((brand, index) => (
                // A posição entra na chave: uma marca nova ainda não tem nome.
                <li key={`${index}:${brand.name}`}>
                  <button type="button" className="row" onClick={() => go('parcerias', index)}>
                    <span className="thumb" style={{ background: brand.color }}>
                      {brand.thumb || brand.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- miniatura no painel, sem otimização
                        <img src={brand.thumb ?? brand.image} alt="" style={{ objectPosition: brand.focus }} />
                      ) : null}
                    </span>
                    <span className="row-text">
                      <strong>{brand.name || 'Parceria nova'}</strong>
                      <small>{brand.perk || brand.category}</small>
                    </span>
                    {brand.code ? <code className="row-code">{brand.code}</code> : null}
                    <span className="row-arrow">
                      <ArrowIcon />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="field-hint">Ainda não há nenhuma.</p>
          )}
          <button type="button" className="add" onClick={() => go('parcerias', 'new')}>
            + Nova parceria
          </button>
        </section>

        <section className="admin-card glass">
          <header>
            <h2>Clips mais vistos</h2>
            <p>Os que o site está a mostrar. Vêm da Twitch, não se mexem aqui.</p>
          </header>
          {overview.clips.length ? (
            <ul className="rows">
              {overview.clips.map((clip) => (
                <li key={clip.id}>
                  <a className="row" href={clip.url} target="_blank" rel="noopener noreferrer">
                    <span className="thumb thumb-wide">
                      {clip.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element -- miniatura no painel, sem otimização
                        <img src={clip.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" />
                      ) : null}
                    </span>
                    <span className="row-text">
                      <strong>{clip.title}</strong>
                      <small>
                        {formatCompact(clip.views)} visualizações · {formatDate(clip.createdAt)}
                      </small>
                    </span>
                    <span className="row-arrow">
                      <ArrowIcon />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="field-hint">Ainda não há clips para mostrar.</p>
          )}
        </section>
      </div>
    </div>
  );
}
