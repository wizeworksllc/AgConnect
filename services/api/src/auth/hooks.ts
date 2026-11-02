import type { BetterAuthOptions } from 'better-auth';
import { getOAuthState } from 'better-auth/api';
import { forgetIdentity, mirrorIdentity, recordAuthEvent, type AuthIdentity } from './mirror.js';
import { authContext } from './request-context.js';

// A social sign-up lands on the provider callback, where our headers are gone. The sign-up form
// sends the role as OAuth additionalData instead. It is client-supplied, the same trust as the
// header, and declaredRole() still refuses anything but worker / employer / training_org.
async function oauthSignupRole(): Promise<string | null> {
  const state = (await getOAuthState().catch(() => null)) as Record<string, unknown> | null;
  return typeof state?.signupRole === 'string' ? state.signupRole : null;
}

// Runs in the auth handler's own request, so the users row exists before the sign-up response returns.
export const databaseHooks: NonNullable<BetterAuthOptions['databaseHooks']> = {
  user: {
    create: {
      after: async (user) => {
        const ctx = authContext();
        const role = ctx.signupRole ?? (await oauthSignupRole());
        const row = await mirrorIdentity(user as AuthIdentity, { role, locale: ctx.locale });
        await recordAuthEvent(row.id, 'user.created', { role: row.role });
      },
    },
    update: {
      after: async (user) => {
        await mirrorIdentity(user as AuthIdentity);
      },
    },
  },
  session: {
    create: {
      after: async (session) => {
        await recordAuthEvent(session.userId, 'session.created');
      },
    },
  },
};

export const afterDeleteUser = async (user: { id: string }) => {
  await forgetIdentity(user.id);
  await recordAuthEvent(user.id, 'user.deleted');
};
