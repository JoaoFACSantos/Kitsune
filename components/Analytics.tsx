import Script from 'next/script';

/**
 * Analytics sem cookies. Ativa com uma destas variáveis:
 * - Plausible: NEXT_PUBLIC_PLAUSIBLE_DOMAIN (e, opcional, NEXT_PUBLIC_PLAUSIBLE_SRC)
 * - Umami: NEXT_PUBLIC_UMAMI_WEBSITE_ID (e, opcional, NEXT_PUBLIC_UMAMI_SRC)
 * Carrega em lazyOnload para não pesar no carregamento.
 */
export function Analytics() {
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (plausible) {
    return (
      <Script
        src={process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? 'https://plausible.io/js/script.outbound-links.file-downloads.js'}
        data-domain={plausible}
        strategy="lazyOnload"
      />
    );
  }
  const umami = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (umami) {
    return (
      <Script
        src={process.env.NEXT_PUBLIC_UMAMI_SRC ?? 'https://cloud.umami.is/script.js'}
        data-website-id={umami}
        strategy="lazyOnload"
      />
    );
  }
  return null;
}
