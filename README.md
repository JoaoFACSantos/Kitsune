# Site de streamer

Site de uma página para uma streamer, com tema girly e muita interação:

- a foto numa moldura de stream, que inclina com o rato;
- stickers que se arrastam;
- corações ao clicar;
- cursor próprio.

Tem cinco partes: hero, clips, setup, parcerias e redes.

Next.js 16 (App Router), TypeScript, Tailwind CSS v4, GSAP e Lenis. Corre em Cloudflare Workers, com o [vinext](https://vinext.dev/).

## Arranque

```bash
npm install
npm run dev
```

O site abre em `http://localhost:3000`, dentro de um Worker local, com uma base de dados também local (em `.cloudflare/state`).

Sem chaves no `.env.local`, o site usa dados mock e aparece como offline. Para testar o estado "em direto" (botão de play e televisão), põe `MOCK_LIVE=true` no `.env.local`; funciona com ou sem chaves da Twitch.

## Personalizar

Todo o conteúdo está em [`content/site.config.ts`](content/site.config.ts):

- nome, handle e cores do tema;
- foto;
- clips de exemplo;
- setup e PC;
- parcerias e redes.

As cores do tema são CSS variables, por isso mudá-las muda o site todo.

As redes, os periféricos, o PC, as marcas das parcerias e os giveaways também se mudam sem tocar no código, no [painel](#painel-admin): o que lá for guardado passa à frente do que está neste ficheiro. Os textos e os títulos mudam-se só aqui.

### A foto do hero

A imagem do hero é a arte da Kitsune com a raposa, em `public/media/kitsune.jpg`. Há duas maneiras de a mostrar, escolhidas em `hero.photoFit`:

- `'cover'` (a que está em uso): uma imagem com fundo, que enche a moldura. Guarda-a em `public/media/`, muda `hero.photo` e `hero.photoSize` (largura e altura reais em px) e, se o corte esconder algo importante, ajusta `hero.photoFocus` (por exemplo `'25% 50%'`).
  Com a televisão ligada, a moldura alarga e o fundo por trás dela é `hero.photoBackdrop`: a mesma imagem a continuar para a direita (a imagem, o seu espelho e a imagem outra vez, lado a lado), muito desfocada. Se trocares a imagem, gera esse ficheiro outra vez; sem ele, fica o fundo normal da moldura.
  Com `hero.photoVideo`, a arte ganha vida: um vídeo curto, sem som e em loop, toca por cima da imagem ([`components/HeroLoop.tsx`](components/HeroLoop.tsx)). Tem de começar e acabar no fotograma da imagem, para repetir sem salto, e ter o mesmo enquadramento. O que está no projeto foi gerado a partir da arte com o modelo Wan 2.2 (primeiro e último fotograma iguais). Se trocares a arte, troca-o também ou tira a linha, e fica a imagem parada.
- `'popout'`: um recorte sem fundo, com a cabeça a sair por cima da moldura.
  1. Recorta a foto até à cintura, com fundo transparente, e exporta em PNG. Podes usar, por exemplo, o remove.bg.
  2. Guarda-a em `public/media/` e muda `hero.photo` e `hero.photoSize`.
  3. Ajusta `hero.photoScale`, que é o tamanho relativo à moldura. Valores maiores fazem a cabeça sair mais por cima. Se precisares, mexe também em `hero.photoOffsetY`.

`public/media/kitsune.svg` é um desenho para o modo `'popout'`. Com `hero.photoWatching: '/media/kitsune.svg#watch'`, as duas viram-se para a televisão quando o direto começa a passar.

### Marcas

As parcerias estão em `partners.brands`. Cada uma é um cartão na fila que passa (pára com o rato em cima e dá para arrastar); ao clicar, o cartão cresce e mostra a marca, as vantagens, o código e um botão para o site.

Para acrescentar ou mudar uma marca:

1. Guarda o banner da marca em `public/partners/` e aponta `image` e `imageSize` para ele. No cartão aberto o banner aparece sempre inteiro: a coluna da imagem ajusta-se ao formato dele (por isso `imageSize` tem de estar certo) e, onde sobrar espaço, vê-se o próprio banner desfocado sobre a cor de `color`.
2. A miniatura do cartão da fila é o mesmo banner cortado em quadrado: `focus` escolhe a parte que fica à vista. Se não ficar bem, usa uma imagem própria em `thumb`.
3. Preenche `perk` (a vantagem principal, no cartão da fila), `about`, `perks` e `note` (idade mínima, riscos, países onde não funciona). Escreve só vantagens que a marca confirma.
4. Em `url` põe o link de afiliada. Se ele já leva o código, marca `codeInLink: true`; senão, o código fica copiado quando a pessoa abre o site.

## Giveaways

A secção dos giveaways fica logo a seguir ao topo e só existe quando faz falta: aparece (com o link no menu) se estiver ligada no painel e houver pelo menos um giveaway por terminar. Cada giveaway tem o prémio, uma imagem (opcional), os passos para participar, um link (opcional) e o último dia para participar (opcional). O dia conta pelo relógio de Lisboa: no dia seguinte, o cartão sai do site sozinho; sem data, fica até ser apagado.

Os giveaways escrevem-se no painel. Em [`content/site.config.ts`](content/site.config.ts) ficam só o título e a frase da secção (`giveaways.title` e `giveaways.intro`).

## Painel (/admin)

Em `/admin` a streamer muda o conteúdo do site sozinha: as marcas das parcerias (com envio de imagens), os giveaways, as redes e os seguidores, os periféricos e o PC. A ordem das marcas, dos giveaways e das redes muda-se a arrastar os cartões (com o teclado: foco na pega e setas para cima e para baixo). Ao guardar, o site fica atualizado nesse momento.

Para o ligar, define o segredo `ADMIN_PASSWORD` no Worker (ver [Deploy](#deploy)), com 12 caracteres ou mais. Sem password o painel fica fechado. A sessão dura duas semanas; mudar a password fecha todas as sessões.

O que fica no painel e o que fica no código:

- **No painel**: `socials`, `discord`, `setup.gear`, `setup.pc`, `partners.brands`, `giveaways.active` e `giveaways.items` (o tipo `EditableContent`, em [`content/types.ts`](content/types.ts)).
- **Só no código**: nome, handle, plataforma, cores, a imagem do hero e todos os textos e títulos (o topo, os clips, o cartão de convite das parcerias e os seus números, as estatísticas a brincar).

O painel guarda tudo numa base de dados D1 da Cloudflare (o binding `DB`, em [`cloudflare.config.ts`](cloudflare.config.ts)). As tabelas criam-se sozinhas na primeira gravação ([`lib/db.ts`](lib/db.ts)):

| Tabela | O que é |
| --- | --- |
| `content` | O conteúdo em vigor. Sem ele, o site usa o de `site.config.ts` |
| `backups` | Cópia do conteúdo antes de cada gravação (ficam as últimas 30) |
| `uploads` | As imagens enviadas, já convertidas em WebP e sem metadados |
| `settings`, `login_failures` | A chave das sessões do painel e as tentativas de entrada falhadas |

As imagens enviadas são reescritas pelo serviço de imagens da Cloudflare (o binding `IMAGES`), que no plano grátis dá 5000 transformações por mês.

Para voltar atrás numa alteração, copia uma linha de `backups` para o lugar do conteúdo (vê os `id` com `SELECT id, saved_at FROM backups`); o site mostra-a no máximo um minuto depois. O ID da base de dados está no painel da Cloudflare, em D1:

```bash
npx cf d1 query <id-da-base-de-dados> --sql "INSERT OR REPLACE INTO content (id, data) SELECT 1, data FROM backups WHERE id = 12"
```

Um Worker não tem disco: para pôr o site num alojamento sem D1, é preciso trocar [`lib/content/store.ts`](lib/content/store.ts) e [`lib/db.ts`](lib/db.ts) (o resto do site só usa as funções que esses ficheiros exportam).

Tudo o que chega do painel é validado no servidor ([`lib/content/validate.ts`](lib/content/validate.ts)): textos com tamanho máximo, só links `http(s)` e só imagens do próprio site. Um campo novo na configuração só aparece no painel depois de entrar em `EditableContent`, na validação e em [`components/admin/sections.tsx`](components/admin/sections.tsx).

## Dados

- **Estado do direto**: vem da Twitch Helix quando `TWITCH_CLIENT_ID` e `TWITCH_CLIENT_SECRET` estão definidos. Usa um app token no servidor, com cache de 60 s. O nav e a moldura atualizam-se sozinhos de 60 em 60 s.
- **Direto na televisão**: em direto, aparece um botão de play na moldura do hero. Ao clicar, a moldura alarga, a ilustração fica à esquerda e o direto passa numa televisão à direita (o player da Twitch só carrega depois do clique). Em ecrãs abaixo de 1024 px, o play abre a Twitch.
- **Clips**: com as chaves da Twitch, a secção mostra os 4 clips mais vistos dos últimos 30 dias (`clips.recentDays`; cache de 1 h) e cada um abre num modal. Se o canal tiver menos de 4 clips nesse período, passa para o último ano e depois para desde sempre. Sem chaves, usa os clips de `clips.items`, que abrem o link do clip.
- **Seguidores**: o número aparece em cada cartão das redes. Na Twitch vem da Helix (com as chaves acima) e no YouTube da Data API (`YOUTUBE_API_KEY` e `YOUTUBE_CHANNEL_ID`), com cache de 1 h. Instagram, TikTok e X não dão o número sem login: escreve-o em `followers`, em `socials`.
- **Discord**: com `discord.invite` preenchido, o número de membros vem da API pública de convites.
- **Outras plataformas**: a fonte de dados está isolada em [`lib/data`](lib/data). Para YouTube ou Kick, cria um adaptador com a mesma interface.

## Rotas

| Rota | O que é |
| --- | --- |
| `/` | A página (ISR, regenera no máximo a cada 60 s) |
| `/api/live` | Estado do direto (cache de 60 s) |
| `/admin` | O painel da streamer (com password) |
| `/uploads/…` | As imagens enviadas no painel |
| `/hero-video` | O vídeo do hero (`hero.photoVideo`), com resposta a pedidos parciais, que o Safari exige |
| `/opengraph-image` | Imagem de partilha, com "EM DIRETO" quando está live |
| `/sitemap.xml`, `/robots.txt`, `/icon` | SEO e ícones |

## Acessibilidade e motion

- **Cursor**: o cursor próprio só aparece com rato. Em ecrãs tácteis fica o comportamento normal.
- **Teclado**: tudo funciona por teclado. A foto é um botão que manda corações. O modal dos clips fecha com Esc.
- **Movimento reduzido**: com `prefers-reduced-motion` não há Lenis, tilt, animações de entrada nem reações a subir.

## Deploy

O site corre num Cloudflare Worker (plano grátis), com uma base de dados D1 para o painel.

```bash
npx cf auth login     # uma vez: abre o browser para entrar na conta Cloudflare
npm run deploy        # faz o build, cria a base de dados se faltar e publica
```

O endereço de produção entra no build: põe `NEXT_PUBLIC_SITE_URL` (e as chaves de analytics, se as usares) num `.env.production` antes do deploy.

As outras chaves do [`.env.example`](.env.example) são segredos do Worker. Definem-se uma vez e ficam de um deploy para o outro:

```bash
npx cf workers secrets update ADMIN_PASSWORD --worker kitsune --type secret_text --text "…"
```

O mesmo para `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `YOUTUBE_API_KEY` e `YOUTUBE_CHANNEL_ID`. Nenhum é obrigatório: sem eles o site usa dados mock e o painel fica fechado.

Para usar um domínio próprio, o domínio tem de estar na mesma conta Cloudflare: acrescenta `domains: ["exemplo.pt"]` ao Worker, em [`cloudflare.config.ts`](cloudflare.config.ts), e faz deploy outra vez.

### Limites do plano grátis

- **100 000 pedidos por dia** ao Worker. Os ficheiros de `/public` e o JavaScript do site não contam; a página, `/api/live` (de 60 em 60 s por aba aberta), o vídeo do hero (`/hero-video`, um a três pedidos por visita) e as imagens de `/uploads` contam.
- **10 ms de processador por pedido.** A página e `/api/live` ficam 60 s na cache da Cloudflare, e enquanto lá estão o Worker não corre. Gerar a página e, sobretudo, a imagem de partilha passa desse tempo; a Cloudflare tolera excessos pontuais. Se aparecer o erro 1102, é este limite.
