import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getServerSession } from '@/lib/auth/server';
import { getEmployerProfile } from '@/lib/api/employer';
import { AccountSurface } from '@/components/employer/account/AccountSurface';

type Props = {
    params: Promise<{ locale: string; rest?: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'employer.account' });
    return { title: `AGCONN — ${t('title')}` };
}

export default async function EmployerAccountPage({ params }: Props) {
    const { locale, rest } = await params;
    const segments = rest ?? [];
    let activeTab: 'profile' | 'security' = 'profile';
    if (segments.length === 0) {
        activeTab = 'profile';
    } else if (segments.length === 1 && segments[0] === 'security') {
        activeTab = 'security';
    } else {
        notFound();
    }

    const [session, profile] = await Promise.all([getServerSession(), getEmployerProfile()]);
    if (!session || !profile) {
        notFound();
    }

    const businessName = profile.dbaName?.trim() || profile.legalName.trim();
    const firstName = session.user.name.trim().split(/\s+/)[0] ?? '';

    return (
        <AccountSurface
            locale={locale}
            activeTab={activeTab}
            firstName={firstName}
            businessName={businessName}
        />
    );
}
