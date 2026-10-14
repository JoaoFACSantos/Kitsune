import { cn } from '@/lib/format';
import { HTML_LANG, LANGS, type Lang, MESSAGES } from '@/lib/i18n';

type LangSwitchProps = {
  /** A língua desta página. */
  lang: Lang;
  /** Esta mesma página em cada língua. */
  hrefs: Record<Lang, string>;
  className?: string;
};

/**
 * O interruptor PT | EN: dois links, para esta mesma página em cada língua. A outra língua
 * carrega de raiz (e não por dentro do site): a página inicial tem animações presas ao scroll
 * que não se dão bem com uma troca a meio.
 */
export function LangSwitch({ lang, hrefs, className }: LangSwitchProps) {
  return (
    <div role="group" aria-label={MESSAGES[lang].switchLabel} className={cn('lang-switch', className)}>
      {LANGS.map((code) => (
        <a
          key={code}
          href={hrefs[code]}
          hrefLang={HTML_LANG[code]}
          lang={HTML_LANG[code]}
          aria-label={MESSAGES[code].langName}
          aria-current={code === lang ? 'true' : undefined}
          className="lang-option"
        >
          {code.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
