import Image from 'next/image';
import Link from 'next/link';
import { LivePill } from '@/components/LivePill';
import { LiveProvider } from '@/components/providers/Live';
import { SocialCard } from '@/components/SocialCard';
import { VisitBeacon } from '@/components/VisitBeacon';
import { SOCIAL_LABELS } from '@/lib/content/editable';
import { getDiscord, getFollowers, getLiveStatus } from '@/lib/data';
import type { ViewProps } from '@/lib/preview';

/**
 * A página de links, para a bio das redes: a fotografia, o nome, o estado do direto (que é o link
 * para o canal), os cartões das redes e o botão para o site. No telemóvel cabe inteira no ecrã,
 * com os cartões uns por baixo dos outros; no computador a fotografia é maior e os cartões ficam
 * dois a dois, como na secção "Redes" do site (o CSS está em globals.css, em "Página de links").
 */
export async function LinksView({ site, base = '', preview = false }: ViewProps) {
  const [live, followers, discord] = await Promise.all([getLiveStatus(), getFollowers(), getDiscord()]);
  const main = site.socials.find((s) => s.id === site.platform);

  return (
    <LiveProvider initial={live}>
      <main id="conteudo" tabIndex={-1} className="links">
        <header className="links-head">
          <span className="links-photo">
            <Image
              src={site.hero.avatar ?? site.hero.photo}
              alt=""
              width={site.hero.photoSize.width}
              height={site.hero.photoSize.height}
              sizes="(min-width: 760px) 230px, 108px"
              priority
              style={site.hero.avatar ? undefined : { objectPosition: site.hero.photoFocus }}
            />
          </span>
          <h1 className="links-name">{site.name}</h1>
          <p className="links-role">{site.role}</p>
          {main ? (
            <a href={main.url} target="_blank" rel="noopener noreferrer" className="links-live" title={`Abrir o canal na ${SOCIAL_LABELS[site.platform]}`}>
              <LivePill />
              <span className="sr-only">: abrir o canal na {SOCIAL_LABELS[site.platform]}</span>
            </a>
          ) : (
            <LivePill />
          )}
        </header>

        <ul className="links-list" aria-label="Redes" style={{ '--n': site.socials.length } as React.CSSProperties}>
          {site.socials.map((s) => (
            <li key={s.id}>
              <SocialCard social={s} count={s.id === 'discord' ? discord.members : (followers[s.id] ?? s.followers)} />
            </li>
          ))}
        </ul>

        <p className="links-foot">
          <Link href={base || '/'} prefetch={false} className="btn btn-primary">
            Visitar o site
            <span aria-hidden className="arrow">
              →
            </span>
          </Link>
        </p>
      </main>
      {preview ? null : <VisitBeacon />}
    </LiveProvider>
  );
}
