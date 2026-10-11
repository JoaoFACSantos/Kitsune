'use client';

import type { Brand, Gear, Social, SocialId, Spec } from '@/content/types';
import { GearGlyph, SocialIcon } from '@/components/icons';
import { GEAR_ICONS, GEAR_LABELS, MAX, SOCIAL_IDS, SOCIAL_LABELS } from '@/lib/content/editable';
import { formatCompact } from '@/lib/format';
import { Card, Check, ColorField, NumberField, Repeater, Row, SelectField, StringList, TextArea, TextField, useForm } from './form';
import { ImageField } from './ImageField';

// As três secções do painel. Os limites (max) são os mesmos da validação do servidor.

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
        <TextField path={`${path}.category`} label="O que é" max={40} placeholder="Nutrição desportiva" hint="Em duas ou três palavras." />
      </Row>
      <TextField
        path={`${path}.perk`}
        label="Vantagem principal"
        max={32}
        placeholder="10% de desconto"
        hint="É o que aparece no cartão pequeno, na fila que passa."
      />
      <TextArea path={`${path}.about`} label="Sobre a marca" max={400} hint="Uma ou duas frases. Aparece quando abrem o cartão." />
      <StringList
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
        <TextField path={`${path}.cta`} label="Texto do botão" max={40} placeholder="Ir para a loja" />
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
      <TextArea
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
      <Card title="Marcas" hint="A ordem aqui é a ordem na fila do site. Clica numa para a abrir.">
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
          {(path, brand) => <BrandFields path={path} brand={brand} />}
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
      <Card title="As tuas redes" hint="A ordem aqui é a ordem dos cartões no site.">
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
      <Card title="Periféricos" hint="O que usas para fazer diretos. Clica num para lhe mudar a marca e o modelo.">
        <Repeater<Gear>
          path="setup.gear"
          sortable={false}
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
                <TextField path={`${path}.label`} label="Tipo" max={24} placeholder="Headset" />
              </Row>
              <TextField path={`${path}.name`} label="Marca e modelo" max={60} placeholder="Razer Kraken Kitty V2 Pro" />
              <TextField path={`${path}.note`} label="Uma frase tua sobre ele (opcional)" max={120} />
              <StringList path={`${path}.tags`} label="Etiquetas" max={MAX.gearTags} itemMax={20} addLabel="Adicionar etiqueta" placeholder="Sem fios" />
            </>
          )}
        </Repeater>
      </Card>

      <Card title="O PC" hint="As peças da máquina, linha a linha.">
        <Repeater<Spec> path="setup.pc" max={MAX.pc} addLabel="Adicionar peça" make={emptySpec}>
          {(path) => (
            <>
              <TextField path={`${path}.label`} label="Peça" max={30} placeholder="Placa gráfica" />
              <TextField path={`${path}.value`} label="Modelo" max={60} placeholder="NVIDIA RTX 4070 Ti Super" />
            </>
          )}
        </Repeater>
      </Card>

    </>
  );
}
