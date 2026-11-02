import 'server-only';
import { redirect } from 'next/navigation';
import { accessFromStatus } from './admin-access';
import { adminFetch } from './api-server';

export type AdminRole = 'admin' | 'super_admin';

export type AdminSession = {
  userId: string;
  email: string | null;
  fullName: string | null;
  adminRole: AdminRole;
};

type MeResponse = { user: { id: string; adminRole: AdminRole; name: string | null; email: string | null } };

// The API owns the admin decision (users.role = 'admin'); this asks it through /admin/v1/me.
export async function fetchAdminSession(): Promise<{ status: number; session: AdminSession | null }> {
  const res = await adminFetch('/admin/v1/me', { raw: true });
  if (!res.ok) return { status: res.status, session: null };
  const body = (await res.json().catch(() => null)) as { ok?: boolean; data?: MeResponse } | null;
  const user = body?.data?.user;
  if (!user) return { status: 500, session: null };
  return {
    status: res.status,
    session: { userId: user.id, email: user.email, fullName: user.name, adminRole: user.adminRole },
  };
}

// Server-side gate. Call from every admin shell page/layout: anonymous → sign-in,
// signed-in non-admin → /forbidden.
export async function requireAdmin(): Promise<AdminSession> {
  const { status, session } = await fetchAdminSession();
  const access = accessFromStatus(status);
  if (access === 'unauthenticated') redirect('/sign-in');
  if (access === 'forbidden' || !session) redirect('/forbidden');
  return session;
}

export function isSuperAdmin(session: AdminSession): boolean {
  return session.adminRole === 'super_admin';
}
