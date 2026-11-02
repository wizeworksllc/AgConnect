'use client';

import type { ReactNode } from 'react';
import { QueryClientBridge } from './QueryClientBridge';
import { LocaleBridge } from './LocaleBridge';
import { ActiveEmployerProvider } from '@/lib/context/active-employer-context';

// Composes the client-first provider tree. Mounted inside AppShellProviders
// in [locale]/layout.tsx, INSIDE <NextIntlClientProvider> (so the bridges can
// read the locale). Auth needs no provider: the session cookie rides on every fetch.
//
// Toast lives upstream via @agconn/ui's <ToastProvider> in AppShellProviders.
// Don't add another toast layer here.
//
// Order:
// 1. QueryClientBridge — needed by every hook downstream
// 2. LocaleBridge — renders null; populates api client config
// 3. ActiveEmployerProvider — depends on api client + provides employer ctx

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientBridge>
      <LocaleBridge />
      <ActiveEmployerProvider>{children}</ActiveEmployerProvider>
    </QueryClientBridge>
  );
}
