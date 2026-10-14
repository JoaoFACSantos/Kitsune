'use client';

import { useState, useSyncExternalStore } from 'react';
import type { Brand, Gear, Giveaway, Rule, Social, SocialId, Spec, Winner } from '@/content/types';
import { GearGlyph, SocialIcon } from '@/components/icons';
import { brandSlug, GEAR_ICONS, GEAR_LABELS, MAX, slugify, SOCIAL_IDS, SOCIAL_LABELS } from '@/lib/content/editable';
import { formatDay, isOpen, today } from '@/lib/content/giveaways';
import { formatCompact } from '@/lib/format';
import { Card, Check, ColorField, DateField, NumberField, Repeater, Row, SelectField, StringList, TextArea, TextField, Toggle, useForm } from './form';
import { NavGlyph } from './icons';
import { ImageField } from './ImageField';
import { BrandLive, GiveawayLive, WithLive } from './Live';

// As secções do painel. Os limites (max) são os mesmos da validação do servidor.

/* ---------- Parcerias ---------- */

export const emptyBrand = (): Brand => ({
  name: '',
  category: '',
  perk: '',
  about: '',
  perks: [],
  url: '',
  cta: 'Ir para o site',
  image: '',
  imageSize: { width: 1, height: 1 },
  color: '#140a18',
});

const noop = () => () => {};

/** O link curto por extenso, com o endereço do site, pronto a copiar. */
function ShortLink({ slug }: { slug: string }) {
  // O endereço do site é o do próprio painel: só se sabe no browser.
  const host = useSyncExternalStore(
    noop,
    () => window.location.host,
    () => '',
  );
  const [copied, setCopied] = useState(false);
  if (!slug || !host) return null;
  const address = `${host}/${slug}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${address}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Sem acesso à área de transferência: o endereço está escrito, copia-se à mão.
    }
  };
  return (
    <p className="short-link">
      <strong>{address}</strong>
      <button type="button" className="review-action" onClick={copy}>
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </p>
  );
}

function BrandFields({ path, brand }: { path: string; brand: Brand }) {
  return (
    <>
      <ImageField
        path={`${path}.image`}
        sizePath={`${path}.imageSize`}
        focusPath={`${path}.focus`}
        tint={brand.color}
        preview={brand.thumb}
        label="Imagem da marca"
        hint="O banner que a marca te deu. JPG, PNG ou WebP, até 8 MB."
      />
      <Row>
        <TextField path={`${path}.name`} label="Nome da marca" max={40} />
        <TextField translate path={`${path}.category`} label="O que é" max={40} placeholder="Nutrição desportiva" hint="Em duas ou três palavras." />
      </Row>
      <TextField
        translate
        path={`${path}.perk`}
        label="Vantagem principal"
        max={32}
        placeholder="10% de desconto"
        hint="É o que aparece no cartão pequeno, na fila que passa."
      />
      <TextArea translate path={`${path}.about`} label="Sobre a marca" max={400} hint="Uma ou duas frases. Aparece quando abrem o cartão." />
      <StringList
        translate
        path={`${path}.perks`}
        label="Vantagens"
        max={MAX.brandPerks}
        itemMax={140}
        addLabel="Adicionar vantagem"
        placeholder="10% de desconto na loja com o código…"
        hint="Só o que a marca confirma. Sem números inventados."
      />
      <Row>
        <TextField path={`${path}.code`} label="O teu código (se houver)" max={24} placeholder="KITSUNE10" optional />
        <TextField translate path={`${path}.cta`} label="Texto do botão" max={40} placeholder="Ir para a loja" />
      </Row>
      <TextField
        path={`${path}.url`}
        type="url"
        label="Link para o site"
        placeholder="https://"
        hint="De preferência o teu link de afiliada, para a visita contar como tua."
      />
      {brand.code ? (
        <Check
          path={`${path}.codeInLink`}
          label="O link já leva o código"
          hint="Se não levar, o código fica copiado quando a pessoa abre o site, pronto a colar no checkout."
        />
      ) : null}
      <TextField
        path={`${path}.slug`}
        label="Link curto (opcional)"
        max={24}
        placeholder={slugify(brand.name) || 'zumub'}
        optional
        hint="Um endereço do teu site que leva direto à marca: fácil de dizer em direto e de pôr numa descrição. O Início do painel mostra quantas vezes foi aberto. Em branco, sai do nome da marca. Se o mudares, a contagem recomeça."
      />
      <ShortLink slug={brandSlug(brand)} />
      <TextArea
        translate
        path={`${path}.note`}
        label="Aviso em letra pequena (opcional)"
        max={300}
        rows={2}
        optional
        hint="Idade mínima, riscos, países onde não funciona."
      />
      <details className="more">
        <summary>Mais opções</summary>
        <ColorField path={`${path}.color`} label="Cor de fundo da imagem" hint="Vê-se atrás da imagem enquanto carrega, ou quando ela não enche o espaço." />
        <ImageField
          path={`${path}.thumb`}
          label="Miniatura própria (opcional)"
          hint="Só se o banner não ficar bem cortado em quadrado: um logo, por exemplo."
          optional
        />
      </details>
    </>
  );
}

export function PartnersSection({ open }: { open?: number }) {
  return (
    <>
      <Card title="Marcas" hint="A ordem aqui é a ordem na fila do site: arrasta um cartão para o mudar de sítio. Clica numa para a abrir.">
        <Repeater<Brand>
          path="partners.brands"
          initialOpen={open}
          max={MAX.brands}
          addLabel="Nova parceria"
          make={emptyBrand}
          confirmRemove={(brand) => `Apagar a parceria${brand.name ? ` com a ${brand.name}` : ''}? Só fica apagada no site depois de guardares.`}
          summary={(brand) => ({
            title: brand.name || 'Nova parceria',
            subtitle: brand.perk,
            media: (
              <span className="thumb" style={{ background: brand.color }}>
                {brand.thumb || brand.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- miniatura no painel, sem otimização
                  <img src={brand.thumb ?? brand.image} alt="" style={{ objectPosition: brand.focus }} />
                ) : null}
              </span>
            ),
          })}
        >
          {(path, brand) => (
            <WithLive card={<BrandLive brand={brand} />}>
              <BrandFields path={path} brand={brand} />
            </WithLive>
          )}
        </Repeater>
      </Card>
    </>
  );
}

/* ---------- Giveaways ---------- */

export const emptyGiveaway = (): Giveaway => ({ title: '', about: '', steps: [], cta: 'Participar' });
const emptyRule = (): Rule => ({ title: '', text: '' });
const emptyWinner = (): Winner => ({ name: '', prize: '' });

function GiveawayFields({ path, day }: { path: string; day: string }) {
  return (
    <>
      <ImageField
        path={`${path}.image`}
        sizePath={`${path}.imageSize`}
        label="Imagem do prémio (opcional)"
        hint="Aparece inteira, sem cortes. JPG, PNG ou WebP, até 8 MB."
        optional
      />
      <TextField translate path={`${path}.title`} label="O prémio" max={60} placeholder="Teclado Keychron Q1 Pro" hint="É o título do cartão." />
      <TextArea translate path={`${path}.about`} label="Sobre o giveaway (opcional)" max={300} hint="Uma ou duas frases: para quem é, quando sai o vencedor." />
      <StringList
        translate
        path={`${path}.steps`}
        label="Como participar"
        max={MAX.giveawaySteps}
        itemMax={140}
        addLabel="Adicionar passo"
        placeholder="Segue o canal na Twitch"
        hint="Um passo por linha. No site aparecem numerados."
      />
      <Row>
        <TextField
          path={`${path}.url`}
          type="url"
          label="Link para participar (opcional)"
          placeholder="https://"
          optional
          hint="O formulário, o tweet ou o Discord. Sem link, o cartão fica sem botão."
        />
        <TextField translate path={`${path}.cta`} label="Texto do botão" max={40} placeholder="Participar" />
      </Row>
      <DateField
        path={`${path}.endsAt`}
        label="Último dia para participar (opcional)"
        min={day}
        hint="No dia seguinte, o giveaway sai do site sozinho. Sem data, fica até o apagares."
      />
    </>
  );
}

// A página do regulamento pode estar fora do site (pages.rules, na configuração): o que se escreve aqui fica guardado para quando voltar.
const RULES_OFF = ' Por agora a página do regulamento está fora do site: o que escreveres aqui fica guardado e só aparece quando ela voltar.';

export function GiveawaysSection({ open, rulesPage }: { open?: number; rulesPage: boolean }) {
  const { draft } = useForm();
  const day = today();
  const { active, items } = draft.giveaways;
  const running = items.filter((item) => isOpen(item, day)).length;
  return (
    <>
      <Card title="No site" hint="A secção fica a seguir às parcerias, com um link no menu.">
        <Toggle
          path="giveaways.active"
          label="Mostrar a secção de giveaways"
          hint="Desligada, a secção e o link do menu saem do site. Os giveaways continuam aqui guardados."
        />
        <p className="field-hint">
          {!active
            ? 'Agora: a secção não aparece no site.'
            : running
              ? `Agora: a secção aparece no site, com ${running} ${running === 1 ? 'giveaway' : 'giveaways'} a decorrer.`
              : 'Agora: a secção está ligada, mas não aparece no site porque não há nenhum giveaway a decorrer.'}
        </p>
      </Card>

      <Card title="Giveaways" hint="A ordem aqui é a ordem dos cartões no site: arrasta um para o mudar de sítio. Clica num para o abrir.">
        <Repeater<Giveaway>
          path="giveaways.items"
          initialOpen={open}
          max={MAX.giveaways}
          addLabel="Novo giveaway"
          make={emptyGiveaway}
          confirmRemove={(item) => `Apagar o giveaway${item.title ? ` «${item.title}»` : ''}? Só fica apagado no site depois de guardares.`}
          summary={(item) => ({
            title: item.title || 'Novo giveaway',
            subtitle: !item.endsAt ? 'Sem data de fim' : isOpen(item, day) ? `Até ${formatDay(item.endsAt)}` : `Terminou a ${formatDay(item.endsAt)}: já não aparece no site`,
            media: item.image ? (
              <span className="thumb">
                {/* eslint-disable-next-line @next/next/no-img-element -- miniatura no painel, sem otimização */}
                <img src={item.image} alt="" />
              </span>
            ) : (
              <span className="thumb thumb-icon thumb-glyph">
                <NavGlyph icon="giveaways" />
              </span>
            ),
          })}
        >
          {(path, item) => (
            <WithLive card={<GiveawayLive item={item} day={day} active={active} />}>
              <GiveawayFields path={path} day={day} />
            </WithLive>
          )}
        </Repeater>
      </Card>

      <Card
        title="Regulamento"
        hint={`As regras que valem para todos os giveaways. Ficam na página /regulamento, com um link por baixo dos cartões. Lê-as e acerta-as ao teu caso: a idade, o país, os prazos.${rulesPage ? '' : RULES_OFF}`}
      >
        <Repeater<Rule> path="giveaways.rules" max={MAX.rules} addLabel="Adicionar regra" make={emptyRule}>
          {(path) => (
            <>
              <TextField translate path={`${path}.title`} label="Regra" max={60} placeholder="Quem pode participar" />
              <TextArea translate path={`${path}.text`} label="O que diz" max={500} rows={2} />
            </>
          )}
        </Repeater>
      </Card>

      <Card
        title="Vencedores"
        hint={`Quem já ganhou, do mais recente para o mais antigo. Aparecem na página /regulamento. Só o nome de utilizador, e só se a pessoa concordar em aparecer.${rulesPage ? '' : RULES_OFF}`}
      >
        <Repeater<Winner> path="giveaways.winners" max={MAX.winners} addLabel="Adicionar vencedor" make={emptyWinner}>
          {(path) => (
            <>
              <TextField path={`${path}.name`} label="Nome de utilizador" max={40} placeholder="@fulana" />
              <TextField translate path={`${path}.prize`} label="O que ganhou" max={60} placeholder="Teclado Keychron Q1 Pro" />
              <DateField path={`${path}.date`} label="Dia (opcional)" />
            </>
          )}
        </Repeater>
      </Card>
    </>
  );
}

/* ---------- Redes ---------- */

function SocialFields({ path, social, taken, auto }: { path: string; social: Social; taken: SocialId[]; auto: Partial<Record<SocialId, boolean>> }) {
  const { set } = useForm();
  // Cada rede só pode aparecer uma vez: a lista mostra a deste item e as que ainda estão livres.
  const options = SOCIAL_IDS.filter((id) => id === social.id || !taken.includes(id)).map((id) => ({ value: id, label: SOCIAL_LABELS[id] }));
  const isDiscord = social.id === 'discord';
  return (
    <>
      <Row>
        <SelectField path={`${path}.id`} label="Rede" options={options} onPick={(id) => set(`${path}.label`, SOCIAL_LABELS[id])} />
        <TextField path={`${path}.handle`} label={isDiscord ? 'Nome do servidor' : 'Nome de utilizador'} max={40} placeholder={isDiscord ? 'Kitsuniverse' : '@souakitsune'} />
      </Row>
      <TextField
        path={`${path}.url`}
        type="url"
        label={isDiscord ? 'Link do convite' : 'Link do perfil'}
        placeholder={isDiscord ? 'https://discord.gg/…' : 'https://'}
        hint={isDiscord ? 'Usa um convite que não expire, senão o link deixa de funcionar.' : undefined}
      />
      {isDiscord ? (
        <NumberField
          path="discord.members"
          label="Membros (reserva)"
          max={100_000_000}
          hint="O número certo vem do Discord sozinho, pelo convite. Este só aparece se o Discord não responder."
        />
      ) : (
        <NumberField
          path={`${path}.followers`}
          label={social.id === 'youtube' ? 'Subscritores' : 'Seguidores'}
          max={2_000_000_000}
          placeholder="25000"
          hint={
            auto[social.id]
              ? `O número certo vem da ${SOCIAL_LABELS[social.id]} sozinho. Este só aparece se a ligação falhar.`
              : 'Esta rede não dá o número sozinha: atualiza-o aqui de vez em quando. Escreve o número inteiro, sem pontos.'
          }
        />
      )}
    </>
  );
}

export function SocialsSection({ auto, open }: { auto: Partial<Record<SocialId, boolean>>; open?: number }) {
  const { draft } = useForm();
  const taken = draft.socials.map((s) => s.id);
  const free = SOCIAL_IDS.filter((id) => !taken.includes(id));
  return (
    <>
      <Card title="As tuas redes" hint="A ordem aqui é a ordem dos cartões no site: arrasta um para o mudar de sítio.">
        <Repeater<Social>
          path="socials"
          initialOpen={open}
          min={1}
          // Com todas as redes já na lista, não há mais nenhuma para acrescentar.
          max={free.length ? MAX.socials : draft.socials.length}
          addLabel="Adicionar rede"
          make={() => ({ id: free[0] ?? 'twitch', label: SOCIAL_LABELS[free[0] ?? 'twitch'], handle: '', url: '' })}
          confirmRemove={(social) => `Tirar ${social.label} do site?`}
          summary={(social) => ({
            title: social.label,
            subtitle: [social.handle, social.id !== 'discord' && social.followers ? `${formatCompact(social.followers)} seguidores` : ''].filter(Boolean).join(' · '),
            media: (
              <span className="thumb thumb-icon">
                <SocialIcon id={social.id} />
              </span>
            ),
          })}
        >
          {(path, social) => <SocialFields path={path} social={social} taken={taken} auto={auto} />}
        </Repeater>
      </Card>
    </>
  );
}

/* ---------- Setup ---------- */

const emptyGear = (): Gear => ({ icon: 'headset', label: '', name: '', note: '' });
const emptySpec = (): Spec => ({ label: '', value: '' });

export function SetupSection() {
  return (
    <>
      <Card title="Periféricos" hint="O que usas para fazer diretos. A ordem aqui é a ordem no site: arrasta um cartão para o mudar de sítio. Clica num para lhe mudar a marca e o modelo.">
        <Repeater<Gear>
          path="setup.gear"
          min={1}
          max={MAX.gear}
          addLabel="Adicionar periférico"
          make={emptyGear}
          confirmRemove={(gear) => `Apagar${gear.name ? ` ${gear.name}` : ' este periférico'}?`}
          summary={(gear) => ({
            title: gear.name || 'Novo periférico',
            subtitle: gear.label,
            media: (
              <span className="thumb thumb-icon">
                <GearGlyph icon={gear.icon} />
              </span>
            ),
          })}
        >
          {(path) => (
            <>
              <Row>
                <SelectField path={`${path}.icon`} label="Desenho" options={GEAR_ICONS.map((icon) => ({ value: icon, label: GEAR_LABELS[icon] }))} />
                <TextField translate path={`${path}.label`} label="Tipo" max={24} placeholder="Headset" />
              </Row>
              <TextField path={`${path}.name`} label="Marca e modelo" max={60} placeholder="Razer Kraken Kitty V2 Pro" />
              <TextField translate path={`${path}.note`} label="Uma frase tua sobre ele (opcional)" max={120} />
              <StringList translate path={`${path}.tags`} label="Etiquetas" max={MAX.gearTags} itemMax={20} addLabel="Adicionar etiqueta" placeholder="Sem fios" />
            </>
          )}
        </Repeater>
      </Card>

      <Card title="O PC" hint="As peças da máquina, linha a linha. Arrasta uma linha pela pega para a mudar de sítio.">
        <Repeater<Spec> path="setup.pc" max={MAX.pc} addLabel="Adicionar peça" make={emptySpec}>
          {(path) => (
            <>
              <TextField translate path={`${path}.label`} label="Peça" max={30} placeholder="Placa gráfica" />
              <TextField path={`${path}.value`} label="Modelo" max={60} placeholder="NVIDIA RTX 4070 Ti Super" />
            </>
          )}
        </Repeater>
      </Card>

    </>
  );
}
