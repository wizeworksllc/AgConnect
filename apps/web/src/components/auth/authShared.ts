'use client';

import { normalizeUsPhone } from '@agconn/schemas';
import { authClient } from '@/lib/auth-client';

export { normalizeUsPhone, isUsE164 } from '@agconn/schemas';

export type SignupRole = 'worker' | 'employer';

export const MIN_PASSWORD_LENGTH = 10;

export function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

export function classifyIdentifier(input: string) {
  if (isEmail(input)) return { kind: 'email' as const, value: input.trim().toLowerCase() };
  const phone = normalizeUsPhone(input);
  if (phone) return { kind: 'phone' as const, value: phone };
  return null;
}

// Only same-origin paths are honored so a crafted link cannot bounce a fresh session off-site.
export function afterAuthPath(locale: string): string {
  if (typeof window !== 'undefined') {
    const target = new URLSearchParams(window.location.search).get('redirect_url');
    if (target && target.startsWith('/') && !target.startsWith('//')) return target;
  }
  return `/${locale}/post-auth`;
}

// A full navigation, so server components re-read the new session cookie.
export function goAfterAuth(locale: string): void {
  window.location.assign(afterAuthPath(locale));
}

export function socialCallbackUrls(locale: string) {
  const origin = window.location.origin;
  return {
    callbackURL: origin + afterAuthPath(locale),
    errorCallbackURL: origin + window.location.pathname,
  };
}

// Phone sign-ups are created with the phone as a placeholder name; replace it with the typed name.
export async function applyTypedName(
  user: { name?: string | null } | null | undefined,
  placeholder: string,
  name: string,
): Promise<void> {
  const current = user?.name?.trim() ?? '';
  if (!name || (current && current !== placeholder)) return;
  await authClient.updateUser({ name });
}

type ErrorKey =
  | 'generic'
  | 'invalid_code'
  | 'code_expired'
  | 'too_many_attempts'
  | 'weak_password'
  | 'wrong_password'
  | 'account_exists'
  | 'invalid_phone'
  | 'link_expired';

const CODE_TO_KEY: Record<string, ErrorKey> = {
  INVALID_OTP: 'invalid_code',
  INVALID_CODE: 'invalid_code',
  INVALID_BACKUP_CODE: 'invalid_code',
  OTP_EXPIRED: 'code_expired',
  TOO_MANY_ATTEMPTS: 'too_many_attempts',
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: 'too_many_attempts',
  PASSWORD_TOO_SHORT: 'weak_password',
  INVALID_EMAIL_OR_PASSWORD: 'wrong_password',
  USER_ALREADY_EXISTS: 'account_exists',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'account_exists',
  INVALID_PHONE_NUMBER: 'invalid_phone',
  INVALID_TOKEN: 'link_expired',
};

// The auth server's own messages are English only, so known codes map to our bilingual copy.
export function localizedAuthError(err: unknown, tErrors: (key: ErrorKey) => string, fallback: ErrorKey): string {
  const code = err && typeof err === 'object' && 'code' in err ? (err as { code?: unknown }).code : undefined;
  const key = typeof code === 'string' ? CODE_TO_KEY[code] : undefined;
  return tErrors(key ?? fallback);
}
