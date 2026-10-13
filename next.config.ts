import type { NextConfig } from 'next';

// Em todas as respostas: o browser passa a vir sempre por HTTPS (um ano), não adivinha tipos de
// ficheiro, não mostra o site dentro de páginas de outros (cliques enganados) e não lhe dá
// câmara, microfone nem localização.
const everywhere = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

// O painel, mais apertado: não aparece dentro de página nenhuma, nem deixa rasto em links.
const admin = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'Referrer-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    // "/:path*" não apanha a raiz nem "/admin/:path*" apanha "/admin": vão à parte. Quando duas
    // regras dão o mesmo cabeçalho vale a última, por isso o painel vem depois.
    return [
      { source: '/', headers: everywhere },
      { source: '/:path*', headers: everywhere },
      { source: '/admin', headers: admin },
      { source: '/admin/:path*', headers: admin },
    ];
  },
  images: {
    // As imagens saem tal como estão em /public, sem passar pelo Worker: os ficheiros estáticos
    // não contam para o limite diário de pedidos do plano grátis da Cloudflare.
    unoptimized: true,
    // Miniaturas de direto e de clips da Twitch.
    remotePatterns: [
      { protocol: 'https', hostname: 'static-cdn.jtvnw.net' },
      { protocol: 'https', hostname: 'clips-media-assets2.twitch.tv' },
    ],
  },
};

export default nextConfig;
