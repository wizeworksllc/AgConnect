'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { Wordmark } from '@/components/primitives/Wordmark';
import { isEmail } from './authShared';
import { AuthAlert, CodeInput, Field, IconInput, SubmitButton, TextLinkButton } from './AuthFields';
import { SocialButtons } from './SocialButtons';
import { useSignInFlow } from './useSignInFlow';

type Props = { locale: string };

export function SignInForm({ locale }: Props) {
  const tShared = useTranslations('auth.shared');
  const t = useTranslations('auth.sign_in');
  const flow = useSignInFlow({ locale });
  const { step, busy } = flow;
  const isCodeStep = step === 'phone_code' || step === 'email_code' || step === 'totp';

  const submitLabel = busy ? (isCodeStep ? tShared('verifying') : tShared('submitting')) : tShared('submit');

  return (
    <div className="bg-base-100 border-base-300 rounded-2xl border p-7 shadow-md">
      <div className="mb-6">
        <p className="text-base-content/60 font-mono text-[10px] font-bold uppercase tracking-[0.18em]">
          {t('eyebrow')}
        </p>
        <h1 className="font-display mt-2 flex flex-wrap items-baseline gap-x-2 text-3xl font-light leading-tight tracking-tight">
          <span>{t('title_a')}</span>
          <Wordmark size="lg" tone="moss" />
        </h1>
        <p className="text-base-content/65 mt-2 text-sm leading-relaxed">{t('subtitle')}</p>
      </div>

      {step === 'identifier' && <SocialButtons locale={locale} disabled={busy} onError={flow.setError} />}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          flow.submit();
        }}
        noValidate
        className="grid gap-4"
      >
        {step === 'identifier' && (
          <Field label={t('identifier_label')} help={t('identifier_help')}>
            <IconInput icon={isEmail(flow.identifier) ? faEnvelope : faPhone}>
              <input
                type="text"
                inputMode="email"
                autoComplete="username"
                placeholder={t('identifier_placeholder')}
                value={flow.identifier}
                onChange={(e) => flow.setIdentifier(e.target.value)}
                className="grow bg-transparent outline-none"
                required
              />
            </IconInput>
          </Field>
        )}

        {step === 'password' && (
          <>
            <p className="text-base-content/70 text-sm">{t('password_subtitle', { target: flow.identifier })}</p>
            <Field label={t('password_label')}>
              <input
                type="password"
                autoComplete="current-password"
                placeholder={t('password_placeholder')}
                value={flow.password}
                onChange={(e) => flow.setPassword(e.target.value)}
                className="input input-bordered w-full"
                required
                autoFocus
              />
            </Field>
          </>
        )}

        {(step === 'phone_code' || step === 'email_code') && (
          <>
            <p className="text-base-content/70 text-sm">{t('verify_subtitle', { target: flow.identifier })}</p>
            <Field label={t('code_label')}>
              <CodeInput value={flow.code} onChange={flow.setCode} />
            </Field>
          </>
        )}

        {step === 'totp' && (
          <>
            <p className="text-base-content/70 text-sm">{t('totp_subtitle')}</p>
            <Field label={flow.useBackupCode ? t('backup_code_label') : t('totp_label')}>
              <CodeInput
                key={flow.useBackupCode ? 'backup' : 'totp'}
                value={flow.code}
                onChange={flow.setCode}
                numeric={!flow.useBackupCode}
                length={flow.useBackupCode ? 11 : 6}
              />
            </Field>
          </>
        )}

        {flow.resetSent && (
          <div role="status" className="alert alert-info alert-soft text-sm">
            {t('reset_sent', { target: flow.identifier })}
          </div>
        )}
        <AuthAlert message={flow.error} />
        <SubmitButton busy={busy} label={submitLabel} />
      </form>

      {step === 'identifier' && (
        <div className="border-base-300 mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm">
          <Link
            href={`/${locale}/worker/sign-up` as Route}
            className="text-base-content/65 hover:text-base-content text-xs no-underline"
          >
            <span>{t('no_account')}</span> <span className="text-primary font-semibold">{t('sign_up_worker')}</span>
          </Link>
          <Link
            href={`/${locale}/employer/sign-up` as Route}
            className="text-primary text-xs font-semibold no-underline hover:underline"
          >
            {t('sign_up_employer')}
          </Link>
        </div>
      )}

      {step !== 'identifier' && (
        <div className="border-base-300 mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <TextLinkButton onClick={flow.restart}>← {t('back_to_identifier')}</TextLinkButton>
          {step === 'password' && (
            <>
              <TextLinkButton onClick={flow.forgotPassword}>{t('forgot_password')}</TextLinkButton>
              <TextLinkButton onClick={flow.requestEmailCode}>{t('email_code_instead')}</TextLinkButton>
            </>
          )}
          {step === 'totp' && (
            <TextLinkButton onClick={flow.toggleBackupCode}>
              {flow.useBackupCode ? t('use_totp') : t('use_backup_code')}
            </TextLinkButton>
          )}
        </div>
      )}
    </div>
  );
}
