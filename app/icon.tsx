import { ImageResponse } from 'next/og';
import { site } from '@/content/site.config';

// Favicon com as cores do tema: coração rosa sobre fundo claro.
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          borderRadius: 18,
          background: site.theme.pinkDeep,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24">
          <path
            d="M12 21C6 17 2 13.4 2 8.9 2 5.6 4.5 3 7.6 3c1.8 0 3.3.8 4.4 2.2C13.1 3.8 14.6 3 16.4 3 19.5 3 22 5.6 22 8.9c0 4.5-4 8.1-10 12.1Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    ),
    size,
  );
}
