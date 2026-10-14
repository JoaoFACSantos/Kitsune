import Link from 'next/link';
import { LangSwitch } from '@/components/LangSwitch';
import { LangProvider } from '@/components/providers/Lang';
import { Title } from '@/components/Title';
import { type Lang, messages } from '@/lib/i18n';

type DocProps = {
  /** Título da página (aceita uma palavra de destaque entre asteriscos). */
  title: string;
  /** Uma ou duas frases por baixo do título. */
  lead: React.ReactNode;
  /** Quando o texto foi revisto pela última vez ("outubro de 2026"). */
  updated?: string;
  /** As outras páginas de texto, para o fundo desta. */
  also: { href: string; label: string }[];
  /** Onde está a página inicial (na pré-visualização do painel fica noutro endereço). */
  home?: string;
  lang?: Lang;
  /** Esta página em cada língua, para o interruptor PT | EN. */
  langHrefs: Record<Lang, string>;
  children: React.ReactNode;
};

/** Uma página de texto (o regulamento, a privacidade): o título, o texto e o caminho de volta. */
export function Doc({ title, lead, updated, also, home = '/', lang = 'pt', langHrefs, children }: DocProps) {
  const m = messages(lang).doc;
  return (
    <LangProvider lang={lang} page>
      <main id="conteudo" tabIndex={-1} className="doc">
        <div className="doc-back">
          <Link href={home} prefetch={false}>
            {m.back}
          </Link>
          <LangSwitch lang={lang} hrefs={langHrefs} />
        </div>
        <Title as="h1" text={title} />
        <p className="lead mt-5">{lead}</p>
        <div className="doc-body">{children}</div>
        <footer className="doc-foot">
          {updated ? <p>{m.reviewed(updated)}</p> : null}
          <p>
            <Link href={home} prefetch={false}>
              {m.site}
            </Link>
            {also.map((page) => (
              <span key={page.href}>
                <span aria-hidden> · </span>
                <Link href={page.href} prefetch={false}>
                  {page.label}
                </Link>
              </span>
            ))}
          </p>
        </footer>
      </main>
    </LangProvider>
  );
}
