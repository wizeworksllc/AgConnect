import Link from 'next/link';
import type { Route } from 'next';
import { useTranslations } from 'next-intl';

type Props = { locale: string; namespace: 'auth.sign_up_worker' | 'auth.sign_up_employer' };

export function SignUpLegal({ locale, namespace }: Props) {
  const t = useTranslations(namespace);
  return (
    <>
      <p className="text-base-content/45 mt-4 text-center text-xs leading-relaxed">
        {t('terms_prefix')}{' '}
        <Link href={`/${locale}/terms` as Route} className="hover:underline">
          {t('terms_link')}
        </Link>{' '}
        {t('and')}{' '}
        <Link href={`/${locale}/privacy` as Route} className="hover:underline">
          {t('privacy_link')}
        </Link>
        .
      </p>
      <p className="text-base-content/45 mt-1 text-center text-xs leading-relaxed">
        {t('california_notice_prefix')}{' '}
        <Link href={`/${locale}/privacy#ccpa` as Route} className="hover:underline">
          {t('california_notice_link')}
        </Link>
        .
      </p>
    </>
  );
}
