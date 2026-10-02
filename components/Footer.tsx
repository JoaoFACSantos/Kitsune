import { BackToTop } from './BackToTop';

const YEAR = new Date().getFullYear();
// Quem fez o site.
const DEVELOPER = { name: 'FAC', url: 'https://github.com/JoaoFACSantos' };

/** Rodapé: nome enorme em contorno que se enche de cor no hover. */
export function Footer({ name, email }: { name: string; email: string }) {
  return (
    <footer className="relative overflow-hidden px-[var(--margin)] pb-10 pt-4">
      <p aria-hidden className="footer-name" data-scroll="in" style={{ '--chars': name.length } as React.CSSProperties}>
        {name.toUpperCase()}
      </p>
      <div className="mx-auto mt-8 flex max-w-[1200px] flex-wrap items-center justify-between gap-4 border-t-2 border-dashed border-line pt-6 text-sm font-semibold text-ink-soft">
        <p>
          © {YEAR} {name} · Developed by{' '}
          <a
            href={DEVELOPER.url}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 font-extrabold text-link underline-offset-4 hover:underline"
          >
            {DEVELOPER.name}
          </a>
        </p>
        <a href={`mailto:${email}`} className="py-2.5 transition-colors hover:text-link">
          {email}
        </a>
        <BackToTop />
      </div>
    </footer>
  );
}
