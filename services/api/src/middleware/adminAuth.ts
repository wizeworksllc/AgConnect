import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { err } from '@agconn/api-client/server';
import { dbClients, runWithRlsContext, UserRole, type PoolName, type Tx } from '@agconn/db';
import type { SessionVars } from '../auth/session.js';
import { findAuthUser } from './auth-bootstrap.js';

// Routes under /admin/v1/* need a signed-in user whose users.role is admin. Admin accounts come
// only from scripts/create-admin.ts, never from self sign-up. users.permissions containing '*'
// marks a super admin, who may run destructive operations.

export type AdminRole = 'admin' | 'super_admin';

export type AdminVars = {
  db: Tx;
  userId: string;
  adminRole: AdminRole;
  // The tenant the admin is impersonating, or null for platform-scope.
  // Header X-Admin-Tenant-Id from the admin app, sourced from /t/<id>/... URL.
  tenantId: string | null;
  role: 'admin';
};

const readTenantHeader = (c: Context): string | null => {
  const raw = c.req.header('x-admin-tenant-id')?.trim();
  if (!raw) return null;
  // Loose uuid sanity check; full validation happens at the data layer.
  return /^[0-9a-f-]{32,36}$/i.test(raw) ? raw.toLowerCase() : null;
};

const readBearer = (header: string | undefined): string | null => {
  const m = header ? /^Bearer\s+(.+)$/i.exec(header.trim()) : null;
  return m?.[1] ?? null;
};

// ADMIN_BEARER_TOKEN lets local dev, CI smoke tests and scripts call /admin/v1/* without a session.
// Presence of the env var is what enables the path.
const bearerMatches = (c: Context) => {
  const expected = process.env.ADMIN_BEARER_TOKEN;
  return Boolean(expected) && readBearer(c.req.header('authorization')) === expected;
};

async function resolveAdmin(
  bearerOk: boolean,
  authUserId: string | null,
): Promise<{ userId: string; adminRole: AdminRole } | null> {
  if (bearerOk) return { userId: 'admin-bearer', adminRole: 'super_admin' };
  if (!authUserId) return null;
  const user = await findAuthUser(authUserId);
  if (!user || user.role !== UserRole.admin) return null;
  return { userId: user.id, adminRole: user.permissions.includes('*') ? 'super_admin' : 'admin' };
}

export const requireAdminUser = (poolName: PoolName) =>
  createMiddleware<{ Variables: AdminVars & SessionVars }>(async (c, next) => {
    const bearerOk = bearerMatches(c);
    const admin = await resolveAdmin(bearerOk, c.var.authUserId);
    if (!admin) {
      return c.var.authUserId || bearerOk
        ? err(c, 403, 'forbidden', 'Admin access required')
        : err(c, 401, 'unauthenticated');
    }
    const tenantId = readTenantHeader(c);
    c.set('db', dbClients[poolName]);
    c.set('userId', admin.userId);
    c.set('adminRole', admin.adminRole);
    c.set('tenantId', tenantId);
    c.set('role', 'admin');
    await runWithRlsContext({ role: 'admin', userId: admin.userId, tenantId: tenantId ?? undefined }, () => next());
  });

export const isSuperAdmin = (c: Context<{ Variables: AdminVars }>) => c.var.adminRole === 'super_admin';
