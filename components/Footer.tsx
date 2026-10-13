import Link from 'next/link';
import { BackToTop } from './BackToTop';

// Quem fez o site.
const DEVELOPER = { name: 'FAC', url: 'https://joaofacsantos.github.io/fac-dev/' };

type FooterProps = {
  name: string;
  /** As outras páginas do site (a de links, a privacidade, o regulamento). */
  links?: { href: string; label: string }[];
};

/** Rodapé: nome enorme em contorno que se enche de cor no hover. */
export function Footer({ name, links = [] }: FooterProps) {
  // O ano lê-se aqui dentro e não no topo do ficheiro: num Worker, fora de um pedido, o relógio
  // está parado em 1970.
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden px-[var(--margin)] pb-10 pt-4">
      <p aria-hidden className="footer-name" data-scroll="in" style={{ '--chars': name.length } as React.CSSProperties}>
        {name.toUpperCase()}
      </p>
      <div className="mx-auto mt-8 flex max-w-[1200px] flex-wrap items-center justify-between gap-4 border-t-2 border-dashed border-line pt-6 text-sm font-semibold text-ink-soft">
        <p>
          © {year} {name} · Developed by{' '}
          <a
            href={DEVELOPER.url}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 font-extrabold text-link underline-offset-4 hover:underline"
          >
            {DEVELOPER.name}
          </a>
        </p>
        {links.length ? (
          <nav aria-label="Mais páginas" className="footer-links">
            {links.map((link) => (
              <Link key={link.href} href={link.href} prefetch={false}>
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
        <BackToTop />
      </div>
    </footer>
  );
}
