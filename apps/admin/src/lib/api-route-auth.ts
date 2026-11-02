import 'server-only';
import { NextResponse } from 'next/server';
import { accessFromStatus } from './admin-access';
import { fetchAdminSession } from './admin-auth';

// Call first in every /api route handler: a 401/403 response, or null when the caller is an admin.
export async function denyUnlessAdmin(): Promise<NextResponse | null> {
  const { status } = await fetchAdminSession().catch(() => ({ status: 401 }));
  const access = accessFromStatus(status);
  if (access === 'allow') return null;
  const code = access === 'unauthenticated' ? 401 : 403;
  return NextResponse.json({ ok: false, error: { code: access } }, { status: code });
}
