import type { PrismaClient } from '@prisma/client';
import { pools } from './pools.js';
import { makeRlsClient } from './rls.js';

// The identity tables (auth_*) answer only to app.role = 'auth'. Forced, so a call made inside
// another runWithRlsContext (an SMS job, a request) still reaches them, and nothing else does.
let client: PrismaClient | undefined;

export const authDb: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    client ??= makeRlsClient(pools.auth, { role: 'auth' }, { force: true });
    return Reflect.get(client as object, prop);
  },
});
