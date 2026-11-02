import { Hono } from 'hono';
import { ok } from '@agconn/api-client/server';
import { authDb } from '@agconn/db';
import { requireAdminUser, type AdminVars } from '../../middleware/adminAuth.js';
import type { AuditCtxVars } from '../../middleware/audit.js';

export const adminMeRoutes = new Hono<{ Variables: AdminVars & AuditCtxVars }>();

adminMeRoutes.use('*', requireAdminUser('admin'));

// Identity + impersonable tenants for the admin shell. No audit log on read —
// session reads are noisy and sign-ins are already in auth_events.
// Mutating admin actions log via the existing audit middleware.
adminMeRoutes.get('/', async (c) => {
  const [tenants, identity] = await Promise.all([
    c.var.db.tenant.findMany({
      where: { deletedAt: null },
      select: { id: true, slug: true, name: true },
      orderBy: { name: 'asc' },
    }),
    authDb.authUser.findUnique({ where: { id: c.var.userId }, select: { name: true, email: true } }),
  ]);

  return ok(c, {
    user: {
      id: c.var.userId,
      adminRole: c.var.adminRole,
      name: identity?.name ?? null,
      email: identity?.email ?? null,
    },
    activeTenantId: c.var.tenantId,
    tenants,
  });
});
