import { BackToTop } from './BackToTop';

const YEAR = new Date().getFullYear();

/** Rodapé: nome enorme em contorno que se enche de cor no hover. */
export function Footer({ name, email }: { name: string; email: string }) {
  return (
    <footer className="relative overflow-hidden px-[var(--margin)] pb-10 pt-4">
      <p aria-hidden className="footer-name" style={{ '--chars': name.length } as React.CSSProperties}>
        {name.toUpperCase()}
      </p>
      <div className="mx-auto mt-8 flex max-w-[1200px] flex-wrap items-center justify-between gap-4 border-t-2 border-dashed border-line pt-6 text-sm font-semibold text-ink-soft">
        <p>
          © {YEAR} {name}
        </p>
        <a href={`mailto:${email}`} className="py-2.5 transition-colors hover:text-link">
          {email}
        </a>
        <BackToTop />
      </div>
    </footer>
  );
}
