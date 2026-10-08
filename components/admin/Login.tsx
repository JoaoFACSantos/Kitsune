'use client';

import { useActionState } from 'react';
import { login } from '@/app/admin/actions';
import { StickerArt } from '@/components/icons';

/** A porta do painel: uma password. */
export function Login({ name }: { name: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="admin-login glass">
      <span aria-hidden className="admin-login-mark">
        <StickerArt kind="fox" />
      </span>
      <p className="kicker">Painel</p>
      <h1>{name}</h1>
      <p className="field-hint">Aqui mudas as parcerias, as redes e os textos do site.</p>
      <div className="field" data-invalid={state ? true : undefined}>
        <label htmlFor="admin-password" className="field-label">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          className="input"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={state ? true : undefined}
          aria-describedby={state ? 'admin-login-error' : undefined}
        />
        {state ? (
          <p id="admin-login-error" className="field-error" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'A entrar…' : 'Entrar'}
      </button>
    </form>
  );
}
