import { bindings, defineConfig, defineWorker } from "cf/config";
import { createWorkersCacheConfig } from "@vinext/cloudflare/cache/config";

const cache = await createWorkersCacheConfig();

// As chaves do .env.example que o Worker lê. Em desenvolvimento declaram-se, para o Worker local
// as ir buscar ao .env.local. No deploy não: um segredo declarado passa a ser obrigatório, e o
// site funciona sem eles (dados mock, painel desligado). Em produção definem-se com
// `cf workers secrets update` e chegam ao Worker na mesma.
const SECRETS = ["ADMIN_PASSWORD", "TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET", "YOUTUBE_API_KEY", "YOUTUBE_CHANNEL_ID", "MOCK_LIVE"];
const localSecrets: object = Object.fromEntries(SECRETS.map((name) => [name, bindings.secret()]));

export default defineConfig({
  worker: defineWorker(({ mode }) => ({
    ...cache,
    name: "kitsune",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-01",
    compatibilityFlags: ["nodejs_compat"],
    assets: { notFoundHandling: "none" },
    // O endereço do site. A zona kitsunetv.pt está na mesma conta da Cloudflare: os registos de
    // DNS e o certificado criam-se sozinhos no deploy. (O "www" só existe para mandar para o
    // endereço sem ele: ver proxy.ts.)
    domains: ["kitsunetv.pt", "www.kitsunetv.pt"],
    env: {
      ...cache.env,
      ...(mode === "development" ? localSecrets : {}),
      ASSETS: bindings.assets(),
      // O que o painel guarda: conteúdo, cópias de segurança e imagens (ver lib/db.ts).
      DB: bindings.d1({ name: "kitsune" }),
      // Reescreve as imagens enviadas no painel (ver app/admin/upload/route.ts).
      IMAGES: bindings.images(),
    },
  })),
});
