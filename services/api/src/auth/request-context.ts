import { AsyncLocalStorage } from 'node:async_hooks';

// Per-request values the auth senders and hooks need but better-auth does not pass them:
// the page locale (x-agconn-locale) and the role a sign-up page declares (x-agconn-signup-role).
export type AuthRequestContext = { locale: 'en' | 'es'; signupRole: string | null };

const als = new AsyncLocalStorage<AuthRequestContext>();

export function contextFromHeaders(headers: Headers): AuthRequestContext {
  const raw = headers.get('x-agconn-locale') ?? headers.get('accept-language') ?? '';
  return {
    locale: raw.toLowerCase().startsWith('en') ? 'en' : 'es',
    signupRole: headers.get('x-agconn-signup-role'),
  };
}

export const runWithAuthContext = <T>(ctx: AuthRequestContext, fn: () => Promise<T>) => als.run(ctx, fn);

export const authContext = (): AuthRequestContext => als.getStore() ?? { locale: 'es', signupRole: null };
