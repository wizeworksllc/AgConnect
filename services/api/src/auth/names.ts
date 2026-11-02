import { authDb } from '@agconn/db';

// First/last name from auth_users.name, for prefilling a stub worker profile. A phone-only
// account's name is its phone number, which is not a name, so it yields blanks.
export async function authNameParts(userId: string): Promise<{ firstName: string; lastName: string }> {
  const row = await authDb.authUser.findUnique({ where: { id: userId }, select: { name: true } }).catch(() => null);
  const name = row?.name?.trim() ?? '';
  if (!name || /^\+?\d[\d\s()-]*$/.test(name)) return { firstName: '', lastName: '' };
  const [firstName = '', ...rest] = name.split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
}
