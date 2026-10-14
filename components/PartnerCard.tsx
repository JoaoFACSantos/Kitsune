'use client';

import Image from 'next/image';
import type { Brand } from '@/content/types';
import { useMessages } from '@/components/providers/Lang';

// As duas caras de uma parceria: o cartão pequeno da fila e o cartão aberto. O site
// (components/Partners.tsx) e o painel (components/admin/Live.tsx, que os mostra ao lado dos
// campos enquanto se escreve) desenham-nas com isto: o que se vê no painel é o que fica no site.

/** O cartão pequeno de uma marca: a miniatura, o nome e a vantagem principal. Vai dentro de um `.brand`. */
export function BrandTile({ brand }: { brand: Brand }) {
  const thumb = brand.thumb ?? brand.image;
  return (
    <>
      <span className="brand-thumb" style={{ background: brand.color }}>
        {/* Só no painel é que uma marca pode estar sem imagem (acabada de criar). */}
        {thumb ? <Image src={thumb} alt="" fill sizes="96px" draggable={false} style={{ objectPosition: brand.focus }} /> : null}
      </span>
      <span className="brand-text">
        <span className="brand-name">{brand.name}</span>
        <span className="brand-category">{brand.category}</span>
        <span className="brand-perk">{brand.perk}</span>
      </span>
    </>
  );
}

type PartnerDetailsProps = {
  brand: Brand;
  /** O id do nome da marca: é por ele que o diálogo do site se apresenta. */
  nameId?: string;
  /** O código acabou de ser copiado (o botão diz que sim durante uns segundos). */
  codeCopied?: boolean;
  onCopyCode?: () => void;
  /** O botão que leva ao site da marca foi clicado. */
  onVisit?: () => void;
};

/** O cartão aberto de uma marca: a imagem, o texto, o código e o botão. Vai dentro de um `.partner-box`. */
export function PartnerDetails({ brand, nameId, codeCopied = false, onCopyCode, onVisit }: PartnerDetailsProps) {
  const m = useMessages().partners;
  return (
    <>
      <div className="partner-art" style={{ background: brand.color }}>
        {brand.image ? (
          <>
            {/* O banner nunca é cortado (as marcas põem texto até à margem); o que sobrar à volta
                leva o próprio banner, desfocado. O "contain" vai aqui e não no CSS: o Image com
                `fill` escreve o object-fit no próprio elemento. */}
            <span aria-hidden className="partner-art-fill" style={{ backgroundImage: `url("${brand.image}")` }} />
            <Image
              src={brand.image}
              alt={m.imageAlt(brand.name)}
              fill
              sizes="(min-width: 760px) 470px, 100vw"
              style={{ objectFit: 'contain' }}
            />
          </>
        ) : null}
      </div>
      <div className="partner-body" data-lenis-prevent>
        <p className="chip self-start">{brand.category}</p>
        <h3 id={nameId} className="partner-name">
          {brand.name}
        </h3>
        <p className="partner-about">{brand.about}</p>
        {brand.perks.length ? (
          <ul className="partner-perks" aria-label={m.perks}>
            {brand.perks.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
        ) : null}
        {brand.code ? (
          <div className="partner-code">
            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">{m.code}</span>
              <strong className="truncate">{brand.code}</strong>
            </span>
            <button type="button" className="btn btn-ghost btn-sm ml-auto" onClick={onCopyCode}>
              {codeCopied ? m.copied : m.copy}
            </button>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a href={brand.url} target="_blank" rel="noopener noreferrer sponsored" className="btn btn-primary" onClick={onVisit}>
            {brand.cta}
            <span aria-hidden className="arrow">
              ↗
            </span>
          </a>
          {brand.code ? (
            <p className="text-sm font-semibold text-ink-soft">
              {brand.codeInLink ? m.codeInLink : m.codeCopied}
            </p>
          ) : null}
        </div>
        {brand.note ? <p className="partner-note">{brand.note}</p> : null}
      </div>
    </>
  );
}
