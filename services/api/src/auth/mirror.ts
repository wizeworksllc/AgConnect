// audit-required:exempt — identity changes are recorded in auth_events (the
// dedicated auth audit log per spec 02-auth); audit_events would duplicate it.
import { declaredRole, langFrom, realEmail } from '@agconn/auth';
import { dbClients, runWithRlsContext, UserRole, type User } from '@agconn/db';
import { recordWebOtpConsent } from '../lib/consent.js';

// The auth_users fields the app mirrors into users. Role, permissions, tenant and consent stay in users.
export type AuthIdentity = {
  id: string;
  email: string;
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean | null;
  signupRole?: string | null;
  locale?: string | null;
};

const asWebhook = <T>(fn: () => Promise<T>) => runWithRlsContext({ role: 'webhook' }, fn);

const consentEligible = (role: UserRole) => role === UserRole.worker || role === UserRole.employer;

// Creates or refreshes the users row for an auth user. A verified phone on a worker or employer is
// TCPA consent (web_otp); recordWebOtpConsent never overwrites an existing consent.
export function mirrorIdentity(u: AuthIdentity, fallback: { role?: string | null; locale?: string | null } = {}): Promise<User> {
  const email = realEmail(u.email);
  const phone = u.phoneNumber ?? null;
  return asWebhook(async () => {
    const db = dbClients.webhooks;
    const user = await db.user.upsert({
      where: { id: u.id },
      update: { email, phone },
      create: {
        id: u.id,
        role: declaredRole(u.signupRole ?? fallback.role),
        preferredLang: langFrom(u.locale ?? fallback.locale),
        email,
        phone,
        tenantId: null,
      },
    });
    if (phone && u.phoneNumberVerified && consentEligible(user.role)) {
      await recordWebOtpConsent(db, u.id);
    }
    return user;
  });
}

// Account deletion keeps the row for retention but drops the tenant binding and contact details.
export function forgetIdentity(userId: string): Promise<unknown> {
  return asWebhook(() =>
    dbClients.webhooks.user.updateMany({
      where: { id: userId },
      data: { tenantId: null, onboarded: false, email: null, phone: null },
    }),
  );
}

export function recordAuthEvent(userId: string, eventType: string, payload: Record<string, unknown> = {}): Promise<unknown> {
  return asWebhook(() =>
    dbClients.webhooks.authEvent.create({
      data: { userId, eventType, payload: payload as object, status: 'processed', processedAt: new Date() },
    }),
  );
}
