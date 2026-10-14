'use client';

import { createContext, useContext, useEffect } from 'react';
import { HTML_LANG, type Lang, MESSAGES } from '@/lib/i18n';

// A língua da página, para os componentes do browser. Fora de um LangProvider (o painel, a
// página de "não encontrado") é o português.

const LangContext = createContext<Lang>('pt');

/** `page`: é a língua da página inteira (e não só de um pedaço, como o cartão ao vivo do painel). */
export function LangProvider({ lang, page = false, children }: { lang: Lang; page?: boolean; children: React.ReactNode }) {
  // O <html> é o mesmo em todas as páginas (app/layout.tsx): ao mudar de língua sem recarregar,
  // acerta-se aqui. No primeiro carregamento já vem certo (o script do layout).
  useEffect(() => {
    if (page) document.documentElement.lang = HTML_LANG[lang];
  }, [lang, page]);
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** Os textos fixos na língua da página (lib/i18n.ts). */
export const useMessages = () => MESSAGES[useContext(LangContext)];
