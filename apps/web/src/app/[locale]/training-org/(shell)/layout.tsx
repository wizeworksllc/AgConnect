import { getServerSession } from '@/lib/auth/server';
import { requireRole, UserRole } from '@/lib/auth/role';
import { TrainingOrgSidebar } from '@/components/training-org/TrainingOrgSidebar';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function TrainingOrgShellLayout({ children, params }: Props) {
  const { locale } = await params;
  await requireRole(locale, UserRole.training_org);
  const session = await getServerSession();
  const displayName =
    session?.user.name ||
    session?.user.email ||
    (locale === 'es' ? 'Organización' : 'Organization');

  return (
    <div className="flex min-h-screen items-start">
      <TrainingOrgSidebar locale={locale} displayName={displayName} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
