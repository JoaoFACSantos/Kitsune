import { Clips } from '@/components/Clips';
import { Footer } from '@/components/Footer';
import { Giveaways } from '@/components/Giveaways';
import { Hero } from '@/components/Hero';
import { Nav } from '@/components/Nav';
import { Partners } from '@/components/Partners';
import { LangProvider } from '@/components/providers/Lang';
import { LiveProvider } from '@/components/providers/Live';
import { Ribbon } from '@/components/Ribbon';
import { ScrollFx } from '@/components/ScrollFx';
import { Setup } from '@/components/Setup';
import { Socials } from '@/components/Socials';
import { ToTopArrow } from '@/components/ToTopArrow';
import { VisitBeacon } from '@/components/VisitBeacon';
import { SOCIAL_LABELS } from '@/lib/content/editable';
import { isOpen, today } from '@/lib/content/giveaways';
import { localize } from '@/lib/content/localize';
import { getClips, getDiscord, getFollowers, getLiveStatus } from '@/lib/data';
import { messages, routesFor } from '@/lib/i18n';
import type { ViewProps } from '@/lib/preview';

/** A página inicial. O site mostra-a com o que está publicado; o painel, com o que lá está por guardar. */
export async function HomeView({ site: config, lang = 'pt', base = '', preview = false }: ViewProps) {
  const site = localize(config, lang);
  const m = messages(lang);
  const routes = routesFor(lang, base);
  const [live, discord, clips, followers] = await Promise.all([getLiveStatus(), getDiscord(), getClips(), getFollowers()]);
  // O número da API, quando existe, substitui o que está escrito na configuração.
  const socials = site.socials.map((s) => ({ ...s, followers: followers[s.id] ?? s.followers }));
  const watchUrl = site.socials.find((s) => s.id === site.platform)?.url ?? '#';
  // Giveaways: só com a secção ligada no painel, e só os que ainda não terminaram.
  const day = today();
  const giveaways = site.giveaways.active ? site.giveaways.items.filter((item) => isOpen(item, day)) : [];

  // JSON-LD: Person com todas as redes em sameAs.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    alternateName: `@${site.handle}`,
    url: `${site.url}${lang === 'en' ? routes.home : ''}`,
    image: `${site.url}/opengraph-image`,
    jobTitle: site.role,
    description: site.description,
    sameAs: site.socials.map((s) => s.url),
  };

  return (
    <LangProvider lang={lang} page>
      <LiveProvider initial={live}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
        <Nav
          name={site.name}
          watchUrl={watchUrl}
          platform={SOCIAL_LABELS[site.platform]}
          themeColors={{ light: site.theme.bg, dark: site.theme.darkBg }}
          langHrefs={{ pt: routesFor('pt', base).home, en: routesFor('en', base).home }}
          links={[
            { id: 'clips', label: m.nav.clips },
            { id: 'setup', label: m.nav.setup },
            { id: 'parcerias', label: m.nav.partners },
            ...(giveaways.length ? [{ id: 'giveaways', label: m.nav.giveaways }] : []),
            { id: 'redes', label: m.nav.socials },
          ]}
        />
        <main id="conteudo" tabIndex={-1}>
          <Hero
            name={site.name}
            greeting={site.hero.greeting}
            role={site.role}
            tagline={site.tagline}
            photo={site.hero.photo}
            photoWatching={site.hero.photoWatching}
            photoAlt={site.hero.photoAlt}
            photoSize={site.hero.photoSize}
            photoFit={site.hero.photoFit}
            photoFocus={site.hero.photoFocus}
            // O vídeo sai por /hero-video e não direto de /public (ver app/hero-video/route.ts). O "v"
            // muda quando o vídeo muda, para o browser não ficar com o antigo que tem guardado.
            photoVideo={site.hero.photoVideo ? `/hero-video?v=${__HERO_VIDEO_VERSION__}` : undefined}
            photoBackdrop={site.hero.photoBackdrop}
            photoScale={site.hero.photoScale}
            photoOffsetY={site.hero.photoOffsetY}
            note={site.hero.note}
            watchUrl={watchUrl}
            platform={site.platform}
            handle={site.handle}
          />
          <Ribbon words={site.hero.ribbon} />
          <Clips title={site.clips.title} intro={site.clips.intro} moreUrl={site.clips.moreUrl} clips={clips} />
          <Setup
            title={site.setup.title}
            intro={site.setup.intro}
            gear={site.setup.gear}
            pc={site.setup.pc}
            funStats={site.setup.funStats}
          />
          <Partners
            title={site.partners.title}
            intro={site.partners.intro}
            stats={site.partners.stats}
            brands={site.partners.brands}
            email={site.email}
            mailSubject={site.partners.mailSubject}
          />
          {giveaways.length ? (
            <Giveaways
              title={site.giveaways.title}
              intro={site.giveaways.intro}
              items={giveaways}
              today={day}
              rulesHref={site.pages.rules ? routes.rules : undefined}
              lang={lang}
            />
          ) : null}
          <Socials
            title={site.socialsSection.title}
            note={site.socialsSection.note}
            socials={socials}
            discordMembers={discord.members}
          />
        </main>
        <Footer
          name={site.name}
          lang={lang}
          links={[
            ...(site.pages.rules && site.giveaways.active ? [{ href: routes.rules, label: m.footer.rules }] : []),
            { href: routes.privacy, label: m.footer.privacy },
          ]}
        />
        <ToTopArrow />
        <ScrollFx />
        {preview ? null : <VisitBeacon />}
      </LiveProvider>
    </LangProvider>
  );
}
