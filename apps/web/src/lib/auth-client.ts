'use client';

import { createAuthClient } from 'better-auth/react';
import {
  emailOTPClient,
  inferAdditionalFields,
  phoneNumberClient,
  twoFactorClient,
} from 'better-auth/client/plugins';

// The auth server lives in services/api at /v1/auth. The session cookie is shared across
// agconn.com subdomains, so every fetch must send credentials.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3001';

const pageLocale = () =>
  typeof document !== 'undefined' && document.documentElement.lang.startsWith('en') ? 'en' : 'es';

export const authClient = createAuthClient({
  baseURL: API_BASE,
  basePath: '/v1/auth',
  fetchOptions: {
    credentials: 'include',
    onRequest: (ctx) => {
      ctx.headers.set('x-agconn-locale', pageLocale());
      return ctx;
    },
  },
  plugins: [
    inferAdditionalFields({
      user: {
        signupRole: { type: 'string', required: false },
        locale: { type: 'string', required: false },
      },
    }),
    phoneNumberClient(),
    emailOTPClient(),
    twoFactorClient(),
  ],
});

// Sign-up pages declare their audience to the server (worker, employer, training_org).
export const signupRoleHeaders = (role: 'worker' | 'employer' | 'training_org') => ({
  headers: { 'x-agconn-signup-role': role },
});

// better-auth errors arrive as { message, code }; show the message, else the page's own copy.
export function authErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === 'string' && m.trim()) return m;
  }
  return fallback;
}

export async function fetchSocialProviders(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/v1/auth/providers`, { credentials: 'include' });
    const json = (await res.json()) as { ok?: boolean; data?: { providers?: string[] } };
    return json.data?.providers ?? [];
  } catch {
    return [];
  }
}
