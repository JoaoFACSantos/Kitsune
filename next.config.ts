import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // Miniaturas de direto e de clips da Twitch.
    remotePatterns: [
      { protocol: 'https', hostname: 'static-cdn.jtvnw.net' },
      { protocol: 'https', hostname: 'clips-media-assets2.twitch.tv' },
    ],
  },
};

export default nextConfig;
