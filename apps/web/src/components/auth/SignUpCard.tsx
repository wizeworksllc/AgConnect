'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { MIN_PASSWORD_LENGTH, isEmail, type SignupRole } from './authShared';
import { AuthAlert, CodeInput, Field, IconInput, SubmitButton } from './AuthFields';
import { SignUpLegal } from './SignUpLegal';
import { SocialButtons } from './SocialButtons';
import { useSignUpFlow } from './useSignUpFlow';

export type SignUpNamespace = 'auth.sign_up_worker' | 'auth.sign_up_employer';

type Props = {
  locale: string;
  role: SignupRole;
  namespace: SignUpNamespace;
  footerLinks: ReactNode;
};

export function SignUpCard({ locale, role, namespace, footerLinks }: Props) {
  const t = useTranslations(namespace);
  const tShared = useTranslations('auth.shared');
  const flow = useSignUpFlow({ locale, role });
  const { step, busy } = flow;

  const submitLabel = busy ? (step === 'verify' ? tShared('verifying') : tShared('submitting')) : tShared('submit');

  return (
    <div className="bg-base-100 border-base-300 rounded-2xl border p-7 shadow-md">
      <div className="mb-6">
        <p className="text-base-content/60 font-mono text-[10px] font-bold uppercase tracking-[0.18em]">
          {t('eyebrow')}
        </p>
        <h1 className="font-display mt-2 text-3xl font-light leading-tight tracking-tight">
          {t('title_a')} <em className="text-primary not-italic font-light">{t('title_b')}</em>
        </h1>
        <p className="text-base-content/65 mt-2 text-sm leading-relaxed">{t('subtitle')}</p>
      </div>

      {step === 'identifier' && <SocialButtons locale={locale} role={role} disabled={busy} onError={flow.setError} />}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          flow.submit();
        }}
        noValidate
        className="grid gap-4"
      >
        {step === 'identifier' && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={t('first_name_label')}>
                <input
                  type="text"
                  autoComplete="given-name"
                  placeholder={t('first_name_placeholder')}
                  value={flow.firstName}
                  onChange={(e) => flow.setFirstName(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </Field>
              <Field label={t('last_name_label')}>
                <input
                  type="text"
                  autoComplete="family-name"
                  placeholder={t('last_name_placeholder')}
                  value={flow.lastName}
                  onChange={(e) => flow.setLastName(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </Field>
            </div>
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
          </>
        )}

        {step === 'password' && (
          <>
            <p className="text-base-content/70 text-sm">{t('password_subtitle', { target: flow.identifier })}</p>
            <Field label={t('password_label')} help={t('password_help')}>
              <input
                type="password"
                autoComplete="new-password"
                value={flow.password}
                onChange={(e) => flow.setPassword(e.target.value)}
                className="input input-bordered w-full"
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoFocus
              />
            </Field>
          </>
        )}

        {step === 'verify' && (
          <>
            <p className="text-base-content/70 text-sm">
              {flow.mode === 'phone'
                ? t('verify_phone_subtitle', { target: flow.identifier })
                : t('verify_email_subtitle', { target: flow.identifier })}
            </p>
            <Field label={t('code_label')}>
              <CodeInput value={flow.code} onChange={flow.setCode} />
            </Field>
          </>
        )}

        <AuthAlert message={flow.error} />
        <SubmitButton busy={busy} label={submitLabel} />
      </form>

      {step === 'identifier' && (
        <div className="border-base-300 mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm">
          {footerLinks}
        </div>
      )}

      <SignUpLegal locale={locale} namespace={namespace} />
    </div>
  );
}
