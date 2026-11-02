import { randomBytes } from 'node:crypto';
import { authDb, Lang } from '@agconn/db';
import { normalizeUsPhone } from '@agconn/schemas';
import { tempEmailForPhone } from './identity.js';

// Identity keystone (docs/00-foundation/13-onboarding-identity-remediation/). An inbound SMS from an
// unknown phone creates a real auth user, so User.id is always an auth user id and a later web sign-in
// by text code lands on the same account. The unique phone_number column does the dedupe.

export type EnsureAuthUserResult = { authUserId: string; created: boolean };

const newId = () => randomBytes(24).toString('base64url');

async function findByPhone(e164: string): Promise<string | null> {
  const row = await authDb.authUser.findUnique({ where: { phoneNumber: e164 }, select: { id: true } });
  return row?.id ?? null;
}

export async function ensureAuthUserByPhone(
  phone: string,
  opts: { locale?: Lang } = {},
): Promise<EnsureAuthUserResult> {
  const e164 = normalizeUsPhone(phone);
  if (!e164) throw new Error(`ensureAuthUserByPhone: not a US phone: ${phone}`);

  const existing = await findByPhone(e164);
  if (existing) return { authUserId: existing, created: false };

  try {
    const created = await authDb.authUser.create({
      data: {
        id: newId(),
        name: e164,
        email: tempEmailForPhone(e164),
        phoneNumber: e164,
        phoneNumberVerified: true,
        signupRole: 'worker',
        locale: opts.locale ?? Lang.es,
      },
      select: { id: true },
    });
    return { authUserId: created.id, created: true };
  } catch (e) {
    // A concurrent inbound for the same phone won the insert.
    const raced = await findByPhone(e164);
    if (raced) return { authUserId: raced, created: false };
    throw e;
  }
}

// SMS onboarding learns the worker's name after the identity exists; mirror it onto auth_users.
export async function updateAuthUserName(
  authUserId: string,
  name: { firstName: string; lastName: string },
): Promise<void> {
  await authDb.authUser.update({
    where: { id: authUserId },
    data: { name: `${name.firstName} ${name.lastName}`.trim() },
  });
}
