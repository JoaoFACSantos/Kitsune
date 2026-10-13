import type { Metadata } from 'next';
import Link from 'next/link';
import { FoxRun } from '@/components/FoxRun';
import { Title } from '@/components/Title';

// A página de "não encontrado": um endereço que não existe, ou um link curto que não é de
// nenhuma parceria (ver app/[slug]/page.tsx). Com um joguinho, para a visita não ser em vão.

export const metadata: Metadata = { title: 'Página não encontrada' };

export default function NotFound() {
  return (
    <main id="conteudo" tabIndex={-1} className="lost">
      <p aria-hidden className="lost-code">
        404
      </p>
      <Title as="h1" text="esta página *fugiu*" />
      <p className="lead">A raposa procurou por todo o lado e não a encontrou. Volta ao site, ou fica um bocadinho: ela precisa de ajuda para saltar.</p>
      <div className="lost-actions">
        <Link href="/" prefetch={false} className="btn btn-primary">
          Voltar ao site
        </Link>
      </div>
      <FoxRun />
    </main>
  );
}
