import 'server-only';
import { headers } from 'next/headers';
import { PHONE_EMAIL_DOMAIN } from './identity';

const API_BASE =
  process.env.API_BASE_URL?.replace(/\/$/, '') ??
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost:3001';

export type ServerSessionUser = { id: string; name: string; email: string | null; image: string | null };

// The incoming request's cookies, for forwarding to the API (which owns the session).
export async function forwardedCookie(): Promise<string | null> {
  try {
    return (await headers()).get('cookie');
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<{ user: ServerSessionUser } | null> {
  const cookie = await forwardedCookie();
  if (!cookie?.includes('session_token')) return null;
  try {
    const res = await fetch(`${API_BASE}/v1/auth/get-session`, { headers: { cookie }, cache: 'no-store' });
    if (!res.ok) return null;
    const body = (await res.json()) as { user?: { id: string; name?: string; email?: string; image?: string | null } } | null;
    if (!body?.user) return null;
    const email = body.user.email?.endsWith(`@${PHONE_EMAIL_DOMAIN}`) ? null : (body.user.email ?? null);
    return { user: { id: body.user.id, name: body.user.name ?? '', email, image: body.user.image ?? null } };
  } catch {
    return null;
  }
}
