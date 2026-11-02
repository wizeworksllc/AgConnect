// Pure auth decisions for the admin app, kept import-free so node:test can load them.

export type ApiAccess = 'allow' | 'unauthenticated' | 'forbidden';

// The ADMIN_BEARER_TOKEN fallback is for local dev and CI only; production never uses it.
export function bearerFallback(token: string, nodeEnv: string | undefined): string | null {
  if (!token || nodeEnv === 'production') return null;
  return `Bearer ${token}`;
}

// The API decides who is an admin (/admin/v1/me); this maps its answer to an access decision.
export function accessFromStatus(status: number): ApiAccess {
  if (status >= 200 && status < 300) return 'allow';
  return status === 401 ? 'unauthenticated' : 'forbidden';
}
