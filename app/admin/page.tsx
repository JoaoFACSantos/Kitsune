import type { Metadata } from 'next';
import { Editor } from '@/components/admin/Editor';
import { Login } from '@/components/admin/Login';
import { LiveProvider } from '@/components/providers/Live';
import { site } from '@/content/site.config';
import { adminStatus, isAdmin, MIN_PASSWORD } from '@/lib/admin/auth';
import { getContent } from '@/lib/content/site';
import { getClips, getDiscord, getFollowers, getLiveStatus } from '@/lib/data';
import './admin.css';

export const metadata: Metadata = { title: 'Painel', robots: { index: false, follow: false } };

// Depende do cookie de sessão e da password no ambiente do servidor: nunca é gerada de antemão.
export const dynamic = 'force-dynamic';

/** O painel da streamer: entra com a password e muda o conteúdo do site sem tocar no código. */
export default async function AdminPage() {
  const status = adminStatus();

  if (status !== 'ready') {
    return (
      <main id="conteudo" tabIndex={-1} className="admin admin-narrow">
        <div className="admin-login glass">
          <p className="kicker">Painel</p>
          <h1>Desligado</h1>
          <p>
            {status === 'weak'
              ? `A password do painel é curta de mais: tem de ter pelo menos ${MIN_PASSWORD} caracteres.`
              : 'O painel ainda não tem password, por isso está fechado.'}
          </p>
          <p className="field-hint">
            Quem trata do site define <code>ADMIN_PASSWORD</code> no ambiente do servidor (no <code>.env.local</code>, por exemplo) e reinicia-o.
          </p>
        </div>
      </main>
    );
  }

  if (!(await isAdmin())) {
    return (
      <main id="conteudo" tabIndex={-1} className="admin admin-narrow">
        <Login name={site.name} />
      </main>
    );
  }

  // O conteúdo a editar e, para o resumo do Início, os mesmos números que o site mostra.
  const [{ content, savedAt }, live, followers, discord, clips] = await Promise.all([getContent(), getLiveStatus(), getFollowers(), getDiscord(), getClips()]);

  return (
    <main id="conteudo" tabIndex={-1} className="admin">
      <LiveProvider initial={live}>
        <Editor
          name={site.name}
          initial={content}
          savedAt={savedAt}
          auto={{
            // Com as chaves no ambiente, estes números chegam sozinhos pelas APIs.
            twitch: site.platform === 'twitch' && Boolean(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET),
            youtube: Boolean(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_CHANNEL_ID),
          }}
          overview={{ followers, discordMembers: discord.members, clips }}
          themeColors={{ light: site.theme.bg, dark: site.theme.darkBg }}
        />
      </LiveProvider>
    </main>
  );
}
