import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { workersCacheCdnAdapter } from "@vinext/cloudflare/cache/workers-cache-cdn-adapter";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";

// Uma marca do vídeo do hero (os .mp4 de public/media), para o endereço dele mudar quando o vídeo
// muda: o browser guarda-o um dia e, sem isto, quem já o viu ficava esse dia com o antigo.
const media = "public/media";
const heroVideoVersion = readdirSync(media)
  .filter((name) => name.endsWith(".mp4"))
  .sort()
  .reduce((hash, name) => hash.update(name).update(readFileSync(`${media}/${name}`)), createHash("sha1"))
  .digest("hex")
  .slice(0, 10);

export default defineConfig({
  define: { __HERO_VIDEO_VERSION__: JSON.stringify(heroVideoVersion) },
  plugins: [
    vinext({
      // A página, o estado do direto e a imagem de partilha ficam na cache da Cloudflare:
      // enquanto lá estão, o Worker nem chega a correr.
      cache: { cdn: workersCacheCdnAdapter() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
