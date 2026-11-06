'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  ToastProvider,
  ModalProvider,
  OfflineBanner,
  InstallPrompt,
  ServiceWorkerProvider,
  pushToast,
} from '@agconn/ui';
import { ApiProvider } from '@agconn/api-client/react';
import { AppProviders } from '@/components/providers/AppProviders';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export function AppShellProviders({
  children,
  enablePwa,
}: {
  children: React.ReactNode;
  enablePwa: boolean;
}) {
  const t = useTranslations('shell');
  const locale = useLocale() as 'en' | 'es';

  return (
    <ToastProvider>
      <ModalProvider
        defaults={{
          confirmLabel: t('modal.confirm'),
          cancelLabel: t('modal.cancel'),
        }}
      >
        <ApiProvider
          baseUrl={API_BASE_URL}
          getLocale={() => locale}
          onUnhandledError={(e) => {
            const variant =
              e.toast === false || e.toast === undefined ? 'error' : e.toast;
            pushToast({
              variant,
              title: e.message || t(`error.${e.code}.title`, { default: e.message }),
              dedupeKey: e.code === 'offline' ? 'offline' : undefined,
            });
          }}
        >
          <OfflineBanner message={t('offline.banner')} />
          <AppProviders>{children}</AppProviders>
          {enablePwa && (
            <>
              <InstallPrompt
                copy={{
                  title: t('install.title'),
                  body: t('install.body'),
                  cta: t('install.cta'),
                  later: t('install.later'),
                }}
              />
              <ServiceWorkerProvider
                scriptUrl="/sw.js"
                copy={{
                  updateTitle: t('update.title'),
                  updateDescription: t('update.description'),
                  updateCta: t('update.cta'),
                }}
              />
            </>
          )}
        </ApiProvider>
      </ModalProvider>
    </ToastProvider>
  );
}
