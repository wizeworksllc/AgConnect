export type { CurrentUser } from '@/lib/auth/use-current-user';

export type LinkedAccount = {
    id: string;
    providerId: string;
    accountId: string;
};

export type LinkedAccounts = {
    accounts: LinkedAccount[] | null;
    hasPassword: boolean;
    reload: () => void;
};
