import Link from 'next/link';
import { Title } from '@/components/Title';

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
  children: React.ReactNode;
};

/** Uma página de texto (o regulamento, a privacidade): o título, o texto e o caminho de volta. */
export function Doc({ title, lead, updated, also, home = '/', children }: DocProps) {
  return (
    <main id="conteudo" tabIndex={-1} className="doc">
      <p className="doc-back">
        <Link href={home} prefetch={false}>
          ← Voltar ao site
        </Link>
      </p>
      <Title as="h1" text={title} />
      <p className="lead mt-5">{lead}</p>
      <div className="doc-body">{children}</div>
      <footer className="doc-foot">
        {updated ? <p>Revisto em {updated}.</p> : null}
        <p>
          <Link href={home} prefetch={false}>
            Site
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
  );
}
