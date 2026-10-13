import Image from 'next/image';
import Link from 'next/link';
import { CopyCode } from '@/components/CopyCode';
import { SocialIcon } from '@/components/icons';
import { LivePill } from '@/components/LivePill';
import { LiveProvider } from '@/components/providers/Live';
import { VisitBeacon } from '@/components/VisitBeacon';
import { brandSlug, SOCIAL_LABELS } from '@/lib/content/editable';
import { isOpen, today } from '@/lib/content/giveaways';
import { getDiscord, getFollowers, getLiveStatus } from '@/lib/data';
import { formatCompact } from '@/lib/format';
import type { ViewProps } from '@/lib/preview';
import { COUNT_LABEL, SOCIAL_COLORS } from '@/lib/social-style';

/**
 * A página de links: as redes, as parcerias com os códigos e, se houver, os giveaways.
 * As parcerias saem pelo link curto de cada uma, marcado com "?de=links": é assim que o painel
 * sabe quantos cliques vieram daqui (ver app/[slug]/page.tsx).
 */
export async function LinksView({ site, base = '', preview = false }: ViewProps) {
  const [live, followers, discord] = await Promise.all([getLiveStatus(), getFollowers(), getDiscord()]);
  const main = site.socials.find((s) => s.id === site.platform);
  const day = today();
  const giveaways = site.giveaways.active ? site.giveaways.items.filter((item) => isOpen(item, day)) : [];
  const home = base || '/';

  return (
    <LiveProvider initial={live}>
      <main id="conteudo" tabIndex={-1} className="links">
        <header className="links-head">
          <span className="links-photo">
            <Image
              src={site.hero.photo}
              alt=""
              width={site.hero.photoSize.width}
              height={site.hero.photoSize.height}
              sizes="120px"
              priority
              style={{ objectPosition: site.hero.photoFocus }}
            />
          </span>
          <h1 className="links-name">{site.name}</h1>
          <p className="links-role">{site.role}</p>
          <LivePill />
        </header>

        {main ? (
          <a href={main.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary links-main">
            {live.live ? 'Ver o direto' : `Ver na ${SOCIAL_LABELS[site.platform]}`}
            <span aria-hidden className="arrow">
              ↗
            </span>
          </a>
        ) : null}

        <section aria-labelledby="links-redes">
          <h2 id="links-redes" className="links-title">
            Redes
          </h2>
          <ul className="links-list">
            {site.socials.map((s) => {
              const count = s.id === 'discord' ? discord.members : (followers[s.id] ?? s.followers);
              return (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-row glass" style={{ '--c': SOCIAL_COLORS[s.id] } as React.CSSProperties}>
                    <span className="link-icon">
                      <SocialIcon id={s.id} />
                    </span>
                    <span className="link-text">
                      <span className="link-label">{s.label}</span>
                      <span className="link-meta">{s.handle}</span>
                    </span>
                    {count ? (
                      <span className="link-count">
                        <strong>{formatCompact(count)}</strong>
                        <span>{COUNT_LABEL[s.id] ?? 'seguidores'}</span>
                      </span>
                    ) : null}
                    <span aria-hidden className="link-arrow">
                      ↗
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        {site.partners.brands.length ? (
          <section aria-labelledby="links-parcerias">
            <h2 id="links-parcerias" className="links-title">
              Códigos e parcerias
            </h2>
            <ul className="links-list">
              {site.partners.brands.map((brand) => (
                <li key={brand.name} className="link-brand glass">
                  <a
                    // Na pré-visualização vai o link da marca: o curto só existe depois de guardar, e contava um clique.
                    href={preview ? brand.url : `/${brandSlug(brand)}?de=links`}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="link-row"
                  >
                    <span className="link-thumb" style={{ background: brand.color }}>
                      <Image src={brand.thumb ?? brand.image} alt="" fill sizes="56px" style={{ objectPosition: brand.focus }} />
                    </span>
                    <span className="link-text">
                      <span className="link-label">{brand.name}</span>
                      <span className="link-meta">{brand.perk}</span>
                    </span>
                    <span aria-hidden className="link-arrow">
                      ↗
                    </span>
                  </a>
                  {brand.code ? <CopyCode code={brand.code} /> : null}
                  {brand.note ? <p className="partner-note">{brand.note}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {giveaways.length ? (
          <section aria-labelledby="links-giveaways">
            <h2 id="links-giveaways" className="links-title">
              Giveaways
            </h2>
            <ul className="links-list">
              {giveaways.map((item) => (
                <li key={item.title}>
                  <Link href={`${home}#giveaways`} prefetch={false} className="link-row glass">
                    <span className="link-text">
                      <span className="link-label">{item.title}</span>
                      <span className="link-meta">Vê como participar</span>
                    </span>
                    <span aria-hidden className="link-arrow">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <footer className="links-foot">
          <Link href={home} prefetch={false}>
            Ver o site completo
          </Link>
          <span aria-hidden> · </span>
          <Link href={`${base}/privacidade`} prefetch={false}>
            Privacidade
          </Link>
          {site.pages.rules && site.giveaways.active ? (
            <>
              <span aria-hidden> · </span>
              <Link href={`${base}/regulamento`} prefetch={false}>
                Regulamento dos giveaways
              </Link>
            </>
          ) : null}
        </footer>
      </main>
      {preview ? null : <VisitBeacon />}
    </LiveProvider>
  );
}
