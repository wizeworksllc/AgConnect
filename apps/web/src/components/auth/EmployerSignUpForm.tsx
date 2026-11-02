'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { SignUpCard } from './SignUpCard';

type Props = { locale: string };

export function EmployerSignUpForm({ locale }: Props) {
  const t = useTranslations('auth.sign_up_employer');
  return (
    <SignUpCard
      locale={locale}
      role="employer"
      namespace="auth.sign_up_employer"
      footerLinks={
        <>
          <Link
            href={`/${locale}/worker/sign-up` as Route}
            className="text-primary text-xs font-semibold no-underline hover:underline"
          >
            {t('worker_instead')}
          </Link>
          <Link
            href={`/${locale}/sign-in` as Route}
            className="text-base-content/65 hover:text-base-content text-xs no-underline"
          >
            <span>{t('have_account')}</span> <span className="text-primary font-semibold">{t('sign_in_link')}</span>
          </Link>
        </>
      }
    />
  );
}
