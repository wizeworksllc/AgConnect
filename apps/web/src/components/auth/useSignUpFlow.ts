'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient, signupRoleHeaders } from '@/lib/auth-client';
import {
  MIN_PASSWORD_LENGTH,
  applyTypedName,
  classifyIdentifier,
  goAfterAuth,
  localizedAuthError,
  type SignupRole,
} from './authShared';

export type SignUpStep = 'identifier' | 'password' | 'verify';
export type SignUpMode = 'phone' | 'email';

export function useSignUpFlow({ locale, role }: { locale: string; role: SignupRole }) {
  const tErrors = useTranslations('auth.shared.errors');

  const [step, setStep] = useState<SignUpStep>('identifier');
  const [mode, setMode] = useState<SignUpMode | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

  async function run(task: () => Promise<string | null>) {
    setSubmitting(true);
    setError(null);
    try {
      const message = await task();
      if (message) setError(message);
    } catch (e) {
      setError(localizedAuthError(e, tErrors, 'generic'));
    } finally {
      setSubmitting(false);
    }
  }

  const startIdentifier = () =>
    run(async () => {
      const classified = classifyIdentifier(identifier);
      if (!classified) return tErrors('invalid_identifier');
      setContact(classified.value);
      if (classified.kind === 'email') {
        setMode('email');
        setStep('password');
        return null;
      }
      const { error: sendError } = await authClient.phoneNumber.sendOtp({ phoneNumber: classified.value });
      if (sendError) return localizedAuthError(sendError, tErrors, 'generic');
      setMode('phone');
      setStep('verify');
      return null;
    });

  const submitPassword = () =>
    run(async () => {
      if (password.length < MIN_PASSWORD_LENGTH) return tErrors('weak_password');
      const { error: signUpError } = await authClient.signUp.email(
        { email: contact, password, name: fullName || contact, signupRole: role, locale },
        signupRoleHeaders(role),
      );
      if (signUpError) return localizedAuthError(signUpError, tErrors, 'generic');
      const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
        email: contact,
        type: 'email-verification',
      });
      if (sendError) return localizedAuthError(sendError, tErrors, 'generic');
      setStep('verify');
      return null;
    });

  const verifyCode = () =>
    run(async () => {
      const otp = code.trim();
      if (mode === 'phone') {
        const { data, error: verifyError } = await authClient.phoneNumber.verify(
          { phoneNumber: contact, code: otp },
          signupRoleHeaders(role),
        );
        if (verifyError) return localizedAuthError(verifyError, tErrors, 'invalid_code');
        await applyTypedName(data?.user, contact, fullName);
      } else {
        const { error: verifyError } = await authClient.emailOtp.verifyEmail({ email: contact, otp });
        if (verifyError) return localizedAuthError(verifyError, tErrors, 'invalid_code');
      }
      setLeaving(true);
      goAfterAuth(locale);
      return null;
    });

  function submit() {
    if (submitting || leaving) return;
    if (step === 'identifier') return void startIdentifier();
    if (step === 'password') return void submitPassword();
    return void verifyCode();
  }

  return {
    step,
    mode,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    identifier,
    setIdentifier,
    contact,
    password,
    setPassword,
    code,
    setCode,
    busy: submitting || leaving,
    error,
    setError,
    submit,
  };
}

export type SignUpFlow = ReturnType<typeof useSignUpFlow>;
