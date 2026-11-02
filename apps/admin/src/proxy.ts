import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';
import { isStrayAction } from './lib/stray-action';

// Next 16 calls this file `proxy.ts` (renamed from `middleware.ts`).
//
// Public routes are the sign-in surface and the 403 page; everything else needs
// the better-auth session cookie. This only checks the cookie is present — the
// admin decision (users.role = 'admin') happens in src/lib/admin-auth.ts, which
// asks the API.

const PUBLIC = /^\/(sign-in|forbidden|monitoring)(\/|$)/;

export default function proxy(req: NextRequest): NextResponse | undefined {
  const path = req.nextUrl.pathname;
  if (isStrayAction(path, req.headers.get('next-action'))) {
    return NextResponse.json({ ok: false, error: { code: 'not_found' } }, { status: 404 });
  }
  if (PUBLIC.test(path) || getSessionCookie(req, { cookiePrefix: 'agconn' })) return undefined;
  if (path.startsWith('/api')) {
    return NextResponse.json({ ok: false, error: { code: 'unauthenticated' } }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/sign-in';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|__dev|og|.*\\..*).*)', '/api', '/api/(.*)'],
};
