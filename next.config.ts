import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        // O painel não pode ser mostrado dentro de outra página (cliques enganados) nem deixar rasto em links.
        source: '/admin/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'Referrer-Policy', value: 'same-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
  images: {
    // Miniaturas de direto e de clips da Twitch.
    remotePatterns: [
      { protocol: 'https', hostname: 'static-cdn.jtvnw.net' },
      { protocol: 'https', hostname: 'clips-media-assets2.twitch.tv' },
    ],
  },
};

export default nextConfig;
