import { UserRole } from '@agconn/db';

export { UserRole };

export {
    ensureAuthUserByPhone,
    updateAuthUserName,
    type EnsureAuthUserResult,
} from './provision-by-phone.js';
export { PHONE_EMAIL_DOMAIN, declaredRole, langFrom, realEmail, tempEmailForPhone } from './identity.js';

// Where each role's home lives within the locale tree. Unknown roles fall
// back to the marketing root.
export function homePathForRole(locale: string, role: UserRole): string {
    switch (role) {
        case UserRole.worker:
            return `/${locale}/worker`;
        case UserRole.employer:
            return `/${locale}/employer`;
        case UserRole.admin:
        case UserRole.training_org:
        default:
            return `/${locale}`;
    }
}

export type ResolvedRole = {
    userId: string;
    role: UserRole;
};
