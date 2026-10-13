'use client';

type PreviewBarProps = {
  /** O que se vê tem alterações que ainda não foram guardadas no painel. */
  changed: boolean;
  /** O site está em manutenção: quem o abre vê só o aviso. */
  hidden: boolean;
};

/** A etiqueta da pré-visualização do painel: diz o que se está a ver e fecha o separador. */
export function PreviewBar({ changed, hidden }: PreviewBarProps) {
  const close = () => {
    // Um separador só se fecha sozinho se foi o painel a abri-lo. Aberto à mão (pelo endereço),
    // o browser não deixa: passado um instante, vai para o painel.
    window.close();
    window.setTimeout(() => {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- o painel carrega de raiz: tem CSS próprio e não leva o scroll suave
      window.location.href = '/admin';
    }, 200);
  };

  return (
    <aside className="preview-bar" aria-label="Pré-visualização">
      <p>
        <strong>Pré-visualização</strong>
        <span>
          {changed ? 'Com o que ainda não guardaste.' : 'Igual ao que está guardado.'}{' '}
          {hidden
            ? 'O site está em manutenção: só tu vês isto.'
            : changed
              ? 'No site só aparece depois de guardares.'
              : 'É o que está no site.'}
        </span>
      </p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={close}>
        Fechar
      </button>
    </aside>
  );
}
