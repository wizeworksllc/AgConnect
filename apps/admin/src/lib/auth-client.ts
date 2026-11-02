'use client';

import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';

// Same auth server as the web app (services/api, /v1/auth). The session cookie is shared on .agconn.com.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3001',
  basePath: '/v1/auth',
  fetchOptions: {
    credentials: 'include',
    onRequest: (ctx) => {
      ctx.headers.set('x-agconn-locale', 'en');
      return ctx;
    },
  },
  plugins: [magicLinkClient()],
});

export async function signOutToSignIn(): Promise<void> {
  await authClient.signOut().catch(() => null);
  window.location.assign('/sign-in');
}
