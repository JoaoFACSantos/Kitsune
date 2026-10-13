import { Clips } from '@/components/Clips';
import { Footer } from '@/components/Footer';
import { Giveaways } from '@/components/Giveaways';
import { Hero } from '@/components/Hero';
import { Maintenance } from '@/components/Maintenance';
import { Nav } from '@/components/Nav';
import { Partners } from '@/components/Partners';
import { LiveProvider } from '@/components/providers/Live';
import { Ribbon } from '@/components/Ribbon';
import { ScrollFx } from '@/components/ScrollFx';
import { Setup } from '@/components/Setup';
import { Socials } from '@/components/Socials';
import { ToTopArrow } from '@/components/ToTopArrow';
import { VisitBeacon } from '@/components/VisitBeacon';
import { isOpen, today } from '@/lib/content/giveaways';
import { getSite } from '@/lib/content/site';
import { getClips, getDiscord, getFollowers, getLiveStatus } from '@/lib/data';

// ISR: a página é estática e regenera no máximo a cada 60 s (estado do direto).
// Quando se guarda alguma coisa no painel (/admin), regenera logo.
export const revalidate = 60;

export default async function Home() {
  // Em manutenção (ligada no painel): só o aviso, sem ir buscar mais nada.
  const config = await getSite();
  if (config.maintenance.active) {
    return <Maintenance title={config.maintenance.title} />;
  }

  // A configuração com o que foi mudado no painel.
  const [site, live, discord, clips, followers] = await Promise.all([getSite(), getLiveStatus(), getDiscord(), getClips(), getFollowers()]);
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
    url: site.url,
    image: `${site.url}/opengraph-image`,
    jobTitle: site.role,
    description: site.description,
    sameAs: site.socials.map((s) => s.url),
  };

  return (
    <LiveProvider initial={live}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Nav
        name={site.name}
        watchUrl={watchUrl}
        themeColors={{ light: site.theme.bg, dark: site.theme.darkBg }}
        links={[
          { id: 'clips', label: 'Clips' },
          { id: 'setup', label: 'Setup' },
          { id: 'parcerias', label: 'Parcerias' },
          ...(giveaways.length ? [{ id: 'giveaways', label: 'Giveaways' }] : []),
          { id: 'redes', label: 'Redes' },
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
        {giveaways.length ? <Giveaways title={site.giveaways.title} intro={site.giveaways.intro} items={giveaways} today={day} /> : null}
        <Socials
          title={site.socialsSection.title}
          note={site.socialsSection.note}
          socials={socials}
          discordMembers={discord.members}
        />
      </main>
      <Footer
        name={site.name}
        links={[
          { href: '/links', label: 'Links' },
          ...(site.giveaways.active ? [{ href: '/regulamento', label: 'Regulamento dos giveaways' }] : []),
          { href: '/privacidade', label: 'Privacidade' },
        ]}
      />
      <ToTopArrow />
      <ScrollFx />
      <VisitBeacon />
    </LiveProvider>
  );
}
