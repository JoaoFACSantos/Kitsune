'use client';

/**
 * Script inline que corre antes do primeiro paint (padrão da doc do Next 16).
 * No cliente fica como text/plain para o React não o tratar como script.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
