import { Hono } from 'hono';
import { requireAdminUser, type AdminVars } from '../../middleware/adminAuth.js';
import type { AuditCtxVars } from '../../middleware/audit.js';
import { adminFlagsRoutes } from './flags.js';
import { adminSystemJobsRoutes } from './jobs.js';
import { adminSystemHealthRoutes } from './health.js';
import { adminLookupsRoutes } from './lookups.js';
import { adminAewrRoutes } from './aewr.js';
import { adminRolesRoutes } from './roles.js';

export const adminSystemRoutes = new Hono<{ Variables: AdminVars & AuditCtxVars }>();

adminSystemRoutes.use('*', requireAdminUser('admin'));

adminSystemRoutes.route('/flags', adminFlagsRoutes);
adminSystemRoutes.route('/jobs', adminSystemJobsRoutes);
adminSystemRoutes.route('/health', adminSystemHealthRoutes);
adminSystemRoutes.route('/lookups', adminLookupsRoutes);
adminSystemRoutes.route('/aewr', adminAewrRoutes);
adminSystemRoutes.route('/roles', adminRolesRoutes);
