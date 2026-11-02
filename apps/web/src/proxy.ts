import { getSessionCookie } from 'better-auth/cookies';
import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

// Next 16 calls this file `proxy.ts` (renamed from `middleware.ts`).
// next-intl handles locale prefixing for marketing + app shell.
//
// Public routes (landing, marketing, auth pages, monitoring tunnel): anyone can
// hit them without a session. Everything else (dashboards, account, onboarding)
// needs the better-auth session cookie. This only checks that the cookie is
// present; the API verifies the session on every call.

const intl = createIntlMiddleware(routing);

// Paths after the locale segment. A trailing slash entry also covers its subpaths.
const PUBLIC_EXACT = new Set([
  '',
  'offline',
  'confirm',
  'unsubscribe',
  'faq',
  'impact',
  'about',
  'contact',
  'employers',
  'partners',
  'trust',
  'skills-wallet',
  'worker-rights',
  'promotora',
  'privacy',
  'terms',
  'subprocessors',
  'sms-consent',
  'accessibility',
  'workers',
  'how-it-works',
  'pricing',
]);

const PUBLIC_PREFIXES = [
  'sign-in',
  'sign-up',
  'worker/sign-up',
  'employer/sign-up',
  'post-auth',
  'reset-password',
  'jobs',
  'training',
  'verify',
  'resources',
  'press',
  'careers',
];

const PUBLIC_ROOT = /^\/(api|icons|monitoring)(\/|$)|^\/(sw\.js|manifest\.webmanifest|llms\.txt|robots\.txt|sitemap\.xml)$/;

function isPublic(path: string): boolean {
  if (path === '/' || PUBLIC_ROOT.test(path)) return true;
  const [, , ...rest] = path.split('/');
  const sub = rest.join('/').replace(/\/$/, '');
  return PUBLIC_EXACT.has(sub) || PUBLIC_PREFIXES.some((p) => sub === p || sub.startsWith(`${p}/`));
}

function localeOf(path: string): string {
  const first = path.split('/')[1] ?? '';
  return (routing.locales as readonly string[]).includes(first) ? first : routing.defaultLocale;
}

export default function proxy(req: NextRequest): NextResponse | Promise<NextResponse> {
  const path = req.nextUrl.pathname;
  if (!isPublic(path) && !getSessionCookie(req, { cookiePrefix: 'agconn' })) {
    const url = req.nextUrl.clone();
    url.pathname = `/${localeOf(path)}/sign-in`;
    url.search = '';
    url.searchParams.set('redirect_url', path);
    return NextResponse.redirect(url);
  }
  return intl(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|__dev|og|monitoring|.*\\..*).*)'],
};
