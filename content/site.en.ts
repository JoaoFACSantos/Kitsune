import type { SiteText } from './types';

/**
 * Os textos do site em inglês (as páginas em /en). São os de content/site.config.ts, traduzidos:
 * quem mudar um texto lá muda o daqui também. O que se escreve no painel (marcas, giveaways,
 * periféricos) tem a versão inglesa no próprio painel.
 */
export const siteEn: SiteText = {
  role: 'Streamer & content creator',
  tagline: 'Games, chatting and lots of laughs, always with the chat.',
  description: 'Kitsune is a streamer and content creator. Clips, setup, partnerships and every social network in one place.',

  hero: {
    greeting: "hi! I'm",
    photoAlt: 'Kitsune, with long red hair, leaning on a winking fox',
    note: 'see you on stream!',
    ribbon: ['streamer', 'gamer', 'content creator', 'just chatting', 'cozy games', 'good vibes'],
  },

  clips: {
    title: 'best *moments*',
    intro: "The channel's most-watched clips.",
  },

  setup: {
    title: 'my *setup*',
    intro: 'Everything I use to play, chat and goof around live.',
    funStats: [
      { value: '240+', label: 'FPS in competitive games' },
      { value: '2', label: 'coffees per stream' },
      { value: '47', label: 'open tabs' },
      { value: '∞', label: 'times I said "last game"' },
    ],
  },

  partners: {
    title: "let's create something *together*?",
    intro: 'Live integrations, dedicated videos and social media campaigns, always with a report at the end. I reply within 48 hours.',
    stats: [
      { value: '100K+', label: 'followers across all platforms' },
      { value: '81%', label: 'of the audience aged 18 to 34' },
      { value: '72%', label: 'of the audience in Portugal' },
    ],
    mailSubject: 'Partnership with Kitsune',
  },

  giveaways: {
    title: 'open *giveaways*',
    intro: 'Enter while you can. Good luck!',
  },

  maintenance: {
    title: 'under *maintenance*',
    opening: {
      title: 'almost *open*',
      text: 'When the countdown hits zero, the site opens by itself: no need to refresh the page.',
    },
  },

  socialsSection: { title: 'follow me *here*', note: "I promise it's worth it" },
};
