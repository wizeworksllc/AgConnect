import { Lang, UserRole } from '@agconn/db';

// A phone-only identity still needs an email in auth_users (better-auth requires one).
// It gets an address on a reserved, undeliverable domain, and the app never treats it as real.
export const PHONE_EMAIL_DOMAIN = 'phone.agconn.invalid';

export const tempEmailForPhone = (e164: string): string =>
  `${e164.replace(/\D/g, '')}@${PHONE_EMAIL_DOMAIN}`;

export const realEmail = (email: string | null | undefined): string | null =>
  email && !email.toLowerCase().endsWith(`@${PHONE_EMAIL_DOMAIN}`) ? email.toLowerCase() : null;

// A sign-up page may declare worker, employer or training_org. Admin is never self-declared.
export function declaredRole(value: string | null | undefined): UserRole {
  return value === UserRole.employer || value === UserRole.training_org ? (value as UserRole) : UserRole.worker;
}

export const langFrom = (value: string | null | undefined): Lang => (value === 'en' ? Lang.en : Lang.es);
