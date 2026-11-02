'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import { classifyIdentifier, goAfterAuth, localizedAuthError } from './authShared';

export type SignInStep = 'identifier' | 'password' | 'phone_code' | 'email_code' | 'totp';

export function useSignInFlow({ locale }: { locale: string }) {
  const tErrors = useTranslations('auth.shared.errors');

  const [step, setStep] = useState<SignInStep>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  async function run(task: () => Promise<string | null | 'done'>) {
    setSubmitting(true);
    setError(null);
    try {
      const result = await task();
      if (result === 'done') {
        setLeaving(true);
        goAfterAuth(locale);
      } else if (result) {
        setError(result);
      }
    } catch (e) {
      setError(localizedAuthError(e, tErrors, 'generic'));
    } finally {
      setSubmitting(false);
    }
  }

  function goTo(next: SignInStep) {
    setCode('');
    setError(null);
    setResetSent(false);
    setStep(next);
  }

  const startIdentifier = () =>
    run(async () => {
      const classified = classifyIdentifier(identifier);
      if (!classified) return tErrors('invalid_identifier');
      setContact(classified.value);
      if (classified.kind === 'email') {
        goTo('password');
        return null;
      }
      const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber: classified.value });
      if (error) return localizedAuthError(error, tErrors, 'generic');
      goTo('phone_code');
      return null;
    });

  const submitPassword = () =>
    run(async () => {
      const { data, error } = await authClient.signIn.email({ email: contact, password });
      if (error) return localizedAuthError(error, tErrors, 'generic');
      if (data && 'twoFactorRedirect' in data && data.twoFactorRedirect) {
        setUseBackupCode(false);
        goTo('totp');
        return null;
      }
      return 'done';
    });

  const requestEmailCode = () =>
    run(async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({ email: contact, type: 'sign-in' });
      if (error) return localizedAuthError(error, tErrors, 'generic');
      goTo('email_code');
      return null;
    });

  const forgotPassword = () =>
    run(async () => {
      setResetSent(false);
      const { error } = await authClient.requestPasswordReset({
        email: contact,
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      });
      if (error) return localizedAuthError(error, tErrors, 'generic');
      setResetSent(true);
      return null;
    });

  const verify = () =>
    run(async () => {
      const otp = code.trim();
      const { error } =
        step === 'phone_code'
          ? await authClient.phoneNumber.verify({ phoneNumber: contact, code: otp })
          : step === 'email_code'
            ? await authClient.signIn.emailOtp({ email: contact, otp })
            : useBackupCode
              ? await authClient.twoFactor.verifyBackupCode({ code: otp })
              : await authClient.twoFactor.verifyTotp({ code: otp });
      if (error) return localizedAuthError(error, tErrors, 'invalid_code');
      return 'done';
    });

  function submit() {
    if (submitting || leaving) return;
    if (step === 'identifier') return void startIdentifier();
    if (step === 'password') return void submitPassword();
    return void verify();
  }

  function restart() {
    setPassword('');
    setUseBackupCode(false);
    goTo('identifier');
  }

  function toggleBackupCode() {
    setCode('');
    setUseBackupCode((v) => !v);
  }

  return {
    step,
    identifier,
    setIdentifier,
    password,
    setPassword,
    code,
    setCode,
    useBackupCode,
    toggleBackupCode,
    busy: submitting || leaving,
    error,
    setError,
    submit,
    requestEmailCode,
    forgotPassword,
    resetSent,
    restart,
  };
}

export type SignInFlow = ReturnType<typeof useSignInFlow>;
