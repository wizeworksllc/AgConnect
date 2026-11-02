import { createMiddleware } from 'hono/factory';
import { authDb } from '@agconn/db';
import { mirrorIdentity } from './mirror.js';
import { auth } from './server.js';

export type SessionVars = { authUserId: string | null };

// Reads the better-auth session cookie once per request into c.var.authUserId.
// Skips the lookup when the request carries no session cookie at all.
export const sessionMiddleware = createMiddleware<{ Variables: SessionVars }>(async (c, next) => {
  let authUserId: string | null = null;
  if (c.req.header('cookie')?.includes('session_token')) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null);
    authUserId = session?.user.id ?? null;
  }
  c.set('authUserId', authUserId);
  await next();
});

// The user.create hook normally writes the users row; this covers an auth user that has none yet.
export async function provisionFromAuth(authUserId: string) {
  const identity = await authDb.authUser.findUnique({ where: { id: authUserId } });
  return identity ? mirrorIdentity(identity) : null;
}
