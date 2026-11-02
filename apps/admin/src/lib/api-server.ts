import 'server-only';
import { headers as requestHeaders } from 'next/headers';
import { bearerFallback } from './admin-access';

// Server-side API client for the admin app. All admin pages call /admin/v1/*
// via this helper — the admin app never touches Prisma directly.
//
// Auth flow:
//   1. Forward the visitor's cookies (the better-auth session cookie lives on
//      .agconn.com, so admin.agconn.com receives it).
//   2. The api's requireAdminUser reads the session and checks users.role.
//   3. Pass the active tenant id (read from the /t/<id>/... URL by the caller)
//      as X-Admin-Tenant-Id so api can pin RLS to that tenant.
//
// Dev/CI fallback: with no session cookie, fall back to ADMIN_BEARER_TOKEN. Lets
// admin pages render during local dev without signing in. Never in production.

const API_BASE = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const ADMIN_BEARER = process.env.ADMIN_BEARER_TOKEN ?? '';

export type AdminApiOk<T> = { ok: true; data: T };
export type AdminApiErr = {
  ok: false;
  error: { code: string; message: string; toast?: 'error' | 'warning' | false };
};
export type AdminApiResponse<T> = AdminApiOk<T> | AdminApiErr;

export type AdminFetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | string[]>;
  tenantId?: string | null;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  raw?: false;
};

export type AdminFetchRawOptions = Omit<AdminFetchOptions, 'raw'> & { raw: true };

function buildUrl(path: string, query?: AdminFetchOptions['query']): string {
  const url = new URL(path.startsWith('/') ? path : `/${path}`, API_BASE);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue;
      if (Array.isArray(v)) {
        for (const item of v) url.searchParams.append(k, String(item));
      } else {
        url.searchParams.append(k, String(v));
      }
    }
  }
  return url.toString();
}

async function sessionCookie(): Promise<string | null> {
  try {
    const cookie = (await requestHeaders()).get('cookie');
    return cookie?.includes('session_token') ? cookie : null;
  } catch {
    // No request context (e.g. local build smoke test).
    return null;
  }
}

export async function adminFetch<T>(
  path: string,
  options?: AdminFetchOptions,
): Promise<AdminApiResponse<T>>;
export async function adminFetch(path: string, options: AdminFetchRawOptions): Promise<Response>;
export async function adminFetch<T>(
  path: string,
  options: AdminFetchOptions | AdminFetchRawOptions = {},
): Promise<AdminApiResponse<T> | Response> {
  const url = buildUrl(path, options.query);
  const headers: Record<string, string> = {
    'accept-language': 'en',
    ...(options.headers ?? {}),
  };
  const cookie = await sessionCookie();
  const fallback = cookie ? null : bearerFallback(ADMIN_BEARER, process.env.NODE_ENV);
  if (cookie) headers.cookie = cookie;
  if (fallback) headers.authorization = fallback;
  if (options.tenantId) headers['x-admin-tenant-id'] = options.tenantId;
  if (options.body !== undefined) headers['content-type'] = 'application/json';

  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store',
    signal: options.signal,
  });

  if ('raw' in options && options.raw) return res;

  if (!res.ok && res.status >= 500) {
    return {
      ok: false,
      error: {
        code: 'upstream_error',
        message: `Upstream returned ${res.status}`,
      },
    } as AdminApiErr;
  }

  const json = (await res.json().catch(() => null)) as AdminApiResponse<T> | null;
  if (json && typeof json === 'object' && 'ok' in json) return json;

  return {
    ok: false,
    error: { code: 'internal_error', message: `Unexpected response (HTTP ${res.status})` },
  } as AdminApiErr;
}
