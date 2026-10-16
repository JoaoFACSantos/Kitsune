'use client';

import type { ReactNode } from 'react';
import type { Brand, Giveaway } from '@/content/types';
import { GiveawayCard } from '@/components/Giveaways';
import { BrandTile, PartnerDetails } from '@/components/PartnerCard';
import { LangProvider } from '@/components/providers/Lang';
import { isOpen } from '@/lib/content/giveaways';
import { inEnglish } from '@/lib/content/localize';
import { useForm } from './form';

// O cartão ao vivo: ao lado dos campos de uma parceria ou de um giveaway (por baixo, em ecrãs
// estreitos), o cartão tal como fica no site, a mudar enquanto se escreve. É desenhado pelos
// mesmos componentes do site e com o mesmo CSS, por isso não há uma segunda versão para acertar.
// É só para ver: não se clica nem leva o foco (inert), e os leitores de ecrã saltam-no, porque
// repete o que está nos campos.

/** Os campos de um item e, ao lado, o cartão ao vivo. */
export function WithLive({ card, children }: { card: ReactNode; children: ReactNode }) {
  return (
    <div className="live">
      <div className="live-fields">{children}</div>
      <div className="live-card" aria-hidden>
        <p className="live-title">
          Como fica no site
          <small>Muda enquanto escreves.</small>
        </p>
        {card}
      </div>
    </div>
  );
}

const lines = (list: string[]) => list.map((line) => line.trim()).filter(Boolean);

/** Uma parceria como aparece no site: o cartão pequeno da fila e o cartão aberto. */
export function BrandLive({ brand: original }: { brand: Brand }) {
  // Com o painel em inglês, o cartão mostra a versão inglesa (o que lá faltar fica em português).
  const { editLang = 'pt' } = useForm();
  const brand = editLang === 'en' ? inEnglish(original) : original;
  // Os campos obrigatórios ainda por escrever levam o nome do campo, para o cartão não ficar oco.
  const shown: Brand = {
    ...brand,
    name: brand.name || 'Nome da marca',
    category: brand.category || 'O que é',
    perk: brand.perk || 'Vantagem principal',
    about: brand.about || 'Uma ou duas frases sobre a marca.',
    cta: brand.cta || 'Ir para o site',
    perks: lines(brand.perks),
  };
  return (
    <LangProvider lang={editLang}>
      <p className="live-label">Na fila das parcerias</p>
      <div className="brand glass" inert>
        <BrandTile brand={shown} />
      </div>
      <p className="live-label">Aberto, como num telemóvel</p>
      <div className="partner-box" inert style={{ '--art-ratio': shown.imageSize.width / shown.imageSize.height } as React.CSSProperties}>
        <span className="partner-close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </span>
        <PartnerDetails brand={shown} />
      </div>
      <p className="live-hint">No computador, a imagem fica ao lado do texto.</p>
    </LangProvider>
  );
}

type GiveawayLiveProps = {
  item: Giveaway;
  /** O dia de hoje em Lisboa. */
  day: string;
  /** A secção de giveaways está ligada no painel. */
  active: boolean;
};

/** Um giveaway como aparece no site. */
export function GiveawayLive({ item: original, day, active }: GiveawayLiveProps) {
  const { editLang = 'pt' } = useForm();
  const item = editLang === 'en' ? inEnglish(original) : original;
  const shown: Giveaway = { ...item, title: item.title || 'O prémio', cta: item.cta || 'Participar', steps: lines(item.steps) };
  const off = !active
    ? 'A secção de giveaways está desligada: este cartão não aparece no site.'
    : !isOpen(item, day)
      ? 'Este giveaway já terminou: não aparece no site.'
      : null;
  return (
    <>
      {off ? <p className="live-note">{off}</p> : null}
      <div inert>
        <GiveawayCard item={shown} today={day} lang={editLang} />
      </div>
      <p className="live-hint">No computador, com um só giveaway a decorrer, os passos e o botão passam para o lado do texto.</p>
    </>
  );
}
