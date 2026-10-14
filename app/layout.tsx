import type { Metadata, Viewport } from 'next';
import { Caveat, Plus_Jakarta_Sans, Unbounded } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';
import { site } from '@/content/site.config';
import { Analytics } from '@/components/Analytics';
import { Cursor } from '@/components/Cursor';
import { InlineScript } from '@/components/InlineScript';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { SkipLink } from '@/components/SkipLink';
import { getSite } from '@/lib/content/site';
import { cursorVars } from '@/lib/cursor';
import { THEME_KEY } from '@/lib/motion';

// A reserva automática da Unbounded fica 5 a 8% mais estreita nos títulos: partiam em menos linhas
// e a página saltava quando a fonte chegava. Usa-se uma reserva própria, afinada no globals.css.
const display = Unbounded({
  subsets: ['latin'],
  variable: '--font-unbounded',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Unbounded Reserva', 'Unbounded Reserva Estreita'],
});
const sans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });
const hand = Caveat({ subsets: ['latin'], weight: '700', variable: '--font-caveat', display: 'swap' });

// O "papel" (role) e o @ do X podem ter sido mudados no painel: lê-se a configuração já com isso.
export async function generateMetadata(): Promise<Metadata> {
  const { role, socials } = await getSite();
  const title = `${site.name} · ${role}`;
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s · ${site.name}` },
    description: site.description,
    applicationName: site.name,
    alternates: { canonical: '/' },
    // O ícone do site é a arte do topo, cortada às duas caras. São ficheiros em /public, feitos
    // por scripts/icons.mjs: saem sem passar pelo Worker.
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/icon.png', type: 'image/png', sizes: '96x96' },
      ],
      apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '180x180' }],
    },
    openGraph: { type: 'profile', locale: 'pt_PT', url: '/', siteName: site.name, title, description: site.description },
    twitter: { card: 'summary_large_image', title, description: site.description, creator: socials.find((s) => s.id === 'x')?.handle },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: site.theme.darkBg,
  colorScheme: 'dark',
};

// Cores do tema vindas da configuração (o CSS escolhe as do tema claro ou escuro).
const theme = {
  '--pink': site.theme.pink,
  '--pink-deep': site.theme.pinkDeep,
  '--lilac': site.theme.lilac,
  '--butter': site.theme.butter,
  '--mint': site.theme.mint,
  '--peach': site.theme.peach,
  '--ink-light': site.theme.ink,
  '--bg-light': site.theme.bg,
  '--ink-dark': site.theme.darkInk,
  '--bg-dark': site.theme.darkBg,
  ...cursorVars(site.theme),
} as React.CSSProperties;

// O tema escuro é o de origem: o <html> já vem com data-theme="dark".
// Antes do primeiro paint: passa para o claro se foi a última escolha no switch (sem piscar).
const themeScript = `try{if(localStorage.getItem('${THEME_KEY}')==='light')delete document.documentElement.dataset.theme}catch(e){}`;

// O <html> é o mesmo em todas as páginas e diz pt-PT: nas páginas em inglês (/en…) passa a "en"
// antes do primeiro paint (é o que os leitores de ecrã usam para escolher a voz).
const langScript = `var p=location.pathname.split('/');if(p[1]==='en'||(p[1]==='admin'&&p[2]==='ver'&&p[3]==='en'))document.documentElement.lang='en'`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" data-theme="dark" className={`${display.variable} ${sans.variable} ${hand.variable}`} style={theme} suppressHydrationWarning>
      <head>
        <InlineScript html={themeScript} />
        <InlineScript html={langScript} />
      </head>
      <body>
        <div aria-hidden className="backdrop">
          <span className="blob blob-1" />
          <span className="blob blob-2" />
          <span className="blob blob-3" />
          <span className="dots" data-scroll="page" data-scroll-direct="" />
          <span className="grain" />
        </div>
        <SkipLink />
        <SmoothScroll>{children}</SmoothScroll>
        <Cursor />
        <Analytics />
      </body>
    </html>
  );
}
