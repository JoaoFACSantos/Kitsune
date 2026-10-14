'use client';

import { usePathname } from 'next/navigation';
import { isEnglishPath, messages } from '@/lib/i18n';

/** O primeiro link da página, para quem usa o teclado saltar o menu. Na língua da página. */
export function SkipLink() {
  const lang = isEnglishPath(usePathname() ?? '') ? 'en' : 'pt';
  return (
    <a href="#conteudo" className="skip-link">
      {messages(lang).skip}
    </a>
  );
}
