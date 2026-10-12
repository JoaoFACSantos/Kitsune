import { Title } from '@/components/Title';

/**
 * O site em manutenção: em vez da página inteira, só o aviso, ao centro do ecrã.
 * Liga-se e desliga-se no painel (Definições), que continua a funcionar em /admin.
 */
export function Maintenance({ title }: { title: string }) {
  return (
    <main id="conteudo" tabIndex={-1} className="maintenance">
      {/* Enquanto dura, os motores de busca não guardam esta página no lugar do site. */}
      <meta name="robots" content="noindex" />
      <Title as="h1" text={title} />
    </main>
  );
}
