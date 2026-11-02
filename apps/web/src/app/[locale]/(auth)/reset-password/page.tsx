import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AuthSplitShell } from '@/components/auth/AuthSplitShell';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; error?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.reset_password' });
  return { title: t('meta_title'), robots: { index: false } };
}

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token, error } = await searchParams;
  return (
    <AuthSplitShell locale={locale} variant="sign_in">
      <ResetPasswordForm locale={locale} token={error ? null : (token ?? null)} />
    </AuthSplitShell>
  );
}
