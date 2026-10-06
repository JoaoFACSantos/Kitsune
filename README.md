# Site de streamer

Site de uma página para uma streamer, com tema girly e muita interação:

- a foto numa moldura de stream, que inclina com o rato;
- stickers que se arrastam;
- corações ao clicar;
- cursor próprio.

Tem cinco partes: hero, clips, setup, parcerias e redes.

Next.js 16 (App Router), TypeScript, Tailwind CSS v4, GSAP e Lenis.

## Arranque

```bash
npm install
npm run dev
```

Sem chaves no `.env`, o site usa dados mock e aparece como offline. Para testar o estado "em direto" (botão de play e televisão), põe `MOCK_LIVE=true` no `.env.local`; funciona com ou sem chaves da Twitch.

## Personalizar

Todo o conteúdo está em [`content/site.config.ts`](content/site.config.ts):

- nome, handle e cores do tema;
- foto;
- clips de exemplo;
- setup e PC;
- parcerias e redes.

As cores do tema são CSS variables, por isso mudá-las muda o site todo.

### A foto do hero

A imagem do hero é a arte da Kitsune com a raposa, em `public/media/kitsune.jpg`. Há duas maneiras de a mostrar, escolhidas em `hero.photoFit`:

- `'cover'` (a que está em uso): uma imagem com fundo, que enche a moldura. Guarda-a em `public/media/`, muda `hero.photo` e `hero.photoSize` (largura e altura reais em px) e, se o corte esconder algo importante, ajusta `hero.photoFocus` (por exemplo `'25% 50%'`).
  Com a televisão ligada, a moldura alarga e o fundo por trás dela é `hero.photoBackdrop`: a mesma imagem a continuar para a direita (a imagem, o seu espelho e a imagem outra vez, lado a lado), muito desfocada. Se trocares a imagem, gera esse ficheiro outra vez; sem ele, fica o fundo normal da moldura.
- `'popout'`: um recorte sem fundo, com a cabeça a sair por cima da moldura.
  1. Recorta a foto até à cintura, com fundo transparente, e exporta em PNG. Podes usar, por exemplo, o remove.bg.
  2. Guarda-a em `public/media/` e muda `hero.photo` e `hero.photoSize`.
  3. Ajusta `hero.photoScale`, que é o tamanho relativo à moldura. Valores maiores fazem a cabeça sair mais por cima. Se precisares, mexe também em `hero.photoOffsetY`.

`public/media/kitsune.svg` é um desenho para o modo `'popout'`. Com `hero.photoWatching: '/media/kitsune.svg#watch'`, as duas viram-se para a televisão quando o direto começa a passar.

### Marcas

As parcerias estão em `partners.brands`. Cada uma é um cartão na fila que passa (pára com o rato em cima e dá para arrastar); ao clicar, o cartão cresce e mostra a marca, as vantagens, o código e um botão para o site.

Para acrescentar ou mudar uma marca:

1. Guarda o banner da marca em `public/partners/` e aponta `image` e `imageSize` para ele. Um banner ao alto enche a coluna do cartão aberto; um deitado (um logo, por exemplo) fica inteiro sobre a cor de `color`.
2. A miniatura do cartão da fila é o mesmo banner cortado em quadrado: `focus` escolhe a parte que fica à vista. Se não ficar bem, usa uma imagem própria em `thumb`.
3. Preenche `perk` (a vantagem principal, no cartão da fila), `about`, `perks` e `note` (idade mínima, riscos, países onde não funciona). Escreve só vantagens que a marca confirma.
4. Em `url` põe o link de afiliada. Se ele já leva o código, marca `codeInLink: true`; senão, o código fica copiado quando a pessoa abre o site.

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
| `/opengraph-image` | Imagem de partilha, com "EM DIRETO" quando está live |
| `/sitemap.xml`, `/robots.txt`, `/icon` | SEO e ícones |

## Acessibilidade e motion

- **Cursor**: o cursor próprio só aparece com rato. Em ecrãs tácteis fica o comportamento normal.
- **Teclado**: tudo funciona por teclado. A foto é um botão que manda corações. O modal dos clips fecha com Esc.
- **Movimento reduzido**: com `prefers-reduced-motion` não há Lenis, tilt, animações de entrada nem reações a subir.

## Deploy

Na Vercel: importa o repositório e define as variáveis de ambiente do [`.env.example`](.env.example).
