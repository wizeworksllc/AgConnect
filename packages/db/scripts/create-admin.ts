// Creates (or promotes) an AGCONN admin account.
//
// What: makes an auth_users row for the email if none exists, then sets the
// matching users row to role = 'admin'. --super adds permission '*', which
// unlocks destructive admin actions (deletes, job replays, audit redaction).
// When: once per staff member. Admins sign in at admin.agconn.com by magic link;
// the magic link only works for an account that already exists, so this script
// is the only way in.
// Touches: auth_users (via authDb) and users (via adminDb). Safe to run twice:
// a second run only re-applies the role and permissions.
// Usage: pnpm --filter @agconn/db admin:create --email you@agconn.com [--name "Ana Ruiz"] [--super] [--dry-run]
import { randomBytes } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { config as loadEnv } from 'dotenv';

const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, '..', '..', '..', '.env') });

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    name: { type: 'string' },
    super: { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
  },
});

const email = values.email?.trim().toLowerCase();
if (!email || !email.includes('@')) {
  console.error('Usage: admin:create --email you@agconn.com [--name "Ana Ruiz"] [--super] [--dry-run]');
  process.exit(1);
}

const { adminDb, authDb, Lang, UserRole } = await import('../src/index.js');

const existing = await authDb.authUser.findUnique({ where: { email }, select: { id: true } });
const permissions = values.super ? ['*'] : [];
console.log(`${existing ? 'Promote' : 'Create'} ${email} as ${values.super ? 'super admin' : 'admin'}`);

if (values['dry-run']) {
  console.log('Dry run: nothing written.');
  process.exit(0);
}

const authUser =
  existing ??
  (await authDb.authUser.create({
    data: {
      id: randomBytes(24).toString('base64url'),
      email,
      name: values.name ?? email,
      emailVerified: true,
      locale: 'en',
    },
    select: { id: true },
  }));

await adminDb.user.upsert({
  where: { id: authUser.id },
  update: { role: UserRole.admin, permissions },
  create: { id: authUser.id, role: UserRole.admin, permissions, email, preferredLang: Lang.en, tenantId: null },
});

console.log(`Done. ${email} can sign in at the admin app by magic link.`);
process.exit(0);
