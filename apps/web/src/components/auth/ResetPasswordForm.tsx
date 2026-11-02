'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import { MIN_PASSWORD_LENGTH, localizedAuthError } from './authShared';
import { AuthAlert, Field, SubmitButton } from './AuthFields';

type Props = { locale: string; token: string | null };

export function ResetPasswordForm({ locale, token }: Props) {
  const t = useTranslations('auth.reset_password');
  const tShared = useTranslations('auth.shared');
  const tErrors = useTranslations('auth.shared.errors');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [linkDead, setLinkDead] = useState(!token);
  const [error, setError] = useState<string | null>(null);

  const signInHref = `/${locale}/sign-in` as Route;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || !token) return;
    if (password.length < MIN_PASSWORD_LENGTH) return setError(tErrors('weak_password'));
    if (password !== confirm) return setError(tErrors('password_mismatch'));
    setBusy(true);
    setError(null);
    try {
      const { error: resetError } = await authClient.resetPassword({ newPassword: password, token });
      if (!resetError) {
        window.location.assign(signInHref);
        return;
      }
      if (resetError.code === 'INVALID_TOKEN') setLinkDead(true);
      else setError(localizedAuthError(resetError, tErrors, 'generic'));
    } catch (err) {
      setError(localizedAuthError(err, tErrors, 'generic'));
    }
    setBusy(false);
  }

  return (
    <div className="bg-base-100 border-base-300 rounded-2xl border p-7 shadow-md">
      <div className="mb-6">
        <p className="text-base-content/60 font-mono text-[10px] font-bold uppercase tracking-[0.18em]">
          {t('eyebrow')}
        </p>
        <h1 className="font-display mt-2 text-3xl font-light leading-tight tracking-tight">
          {linkDead ? t('invalid_title') : t('title')}
        </h1>
        <p className="text-base-content/65 mt-2 text-sm leading-relaxed">
          {linkDead ? t('invalid_body') : t('subtitle')}
        </p>
      </div>

      {linkDead ? (
        <Link href={signInHref} className="btn btn-primary w-full rounded-full font-semibold">
          {t('back_to_sign_in')}
        </Link>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-4">
          <Field label={t('password_label')} help={t('password_help')}>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoFocus
            />
          </Field>
          <Field label={t('confirm_label')}>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input input-bordered w-full"
              required
              minLength={MIN_PASSWORD_LENGTH}
            />
          </Field>
          <AuthAlert message={error} />
          <SubmitButton busy={busy} label={busy ? tShared('submitting') : tShared('submit')} />
        </form>
      )}
    </div>
  );
}
