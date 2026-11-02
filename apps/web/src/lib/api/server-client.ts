import 'server-only';
import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import { createApiClient, type ApiClient } from '@agconn/api-client/client';
import { forwardedCookie } from '@/lib/auth/server';

// The active employer for a multi-employer member is persisted in this
// cookie by the employer switcher. The API validates it against the
// caller's membership set; an absent/stale value just falls back to the
// caller's sole membership (or 409 employer_unselected when ambiguous).
export const ACTIVE_EMPLOYER_COOKIE = 'agconn_active_employer';

const BASE_URL =
  process.env.API_BASE_URL?.replace(/\/$/, '') ??
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost:3001';

export async function getServerApiClient(): Promise<ApiClient> {
  const locale = (await getLocale().catch(() => 'en')) as 'en' | 'es';
  // The API reads the better-auth session cookie, so the visitor's cookies are forwarded as-is.
  const cookie = await forwardedCookie();
  const activeEmployerId = await getActiveEmployerId();
  const extra: Record<string, string> = {};
  if (cookie) extra.cookie = cookie;
  if (activeEmployerId) extra['X-Employer-Id'] = activeEmployerId;
  return createApiClient({
    baseUrl: BASE_URL,
    getLocale: () => (locale === 'es' ? 'es' : 'en'),
    getHeaders: () => extra,
  });
}

export async function getActiveEmployerId(): Promise<string | null> {
  try {
    const jar = await cookies();
    return jar.get(ACTIVE_EMPLOYER_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}

export type Unwrap<T> = T extends { ok: true; data: infer D } ? D : never;
