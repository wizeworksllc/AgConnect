'use client';

import { PHONE_EMAIL_DOMAIN } from '@/lib/auth/identity';
import { authClient } from '@/lib/auth-client';

export type CurrentUser = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string | null;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  image: string | null;
  twoFactorEnabled: boolean;
};

type RawUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: boolean | null;
  image?: string | null;
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean | null;
  twoFactorEnabled?: boolean | null;
};

const isPhoneName = (name: string) => /^\+?\d[\d\s()-]*$/.test(name);

export function toCurrentUser(u: RawUser): CurrentUser {
  const name = u.name && !isPhoneName(u.name) ? u.name.trim() : '';
  const [firstName = '', ...rest] = name ? name.split(/\s+/) : [];
  const email = u.email && !u.email.toLowerCase().endsWith(`@${PHONE_EMAIL_DOMAIN}`) ? u.email : null;
  return {
    id: u.id,
    name,
    firstName,
    lastName: rest.join(' '),
    email,
    emailVerified: Boolean(email && u.emailVerified),
    phone: u.phoneNumber ?? null,
    phoneVerified: Boolean(u.phoneNumberVerified),
    image: u.image ?? null,
    twoFactorEnabled: Boolean(u.twoFactorEnabled),
  };
}

// The signed-in user for client components. isLoaded is false until the first session fetch settles.
export function useCurrentUser(): { isLoaded: boolean; isSignedIn: boolean; user: CurrentUser | null; refetch: () => void } {
  const { data, isPending, refetch } = authClient.useSession();
  const user = data?.user ? toCurrentUser(data.user as RawUser) : null;
  return { isLoaded: !isPending, isSignedIn: Boolean(user), user, refetch: () => void refetch() };
}

export async function signOutTo(path: string): Promise<void> {
  await authClient.signOut().catch(() => null);
  window.location.assign(path);
}
