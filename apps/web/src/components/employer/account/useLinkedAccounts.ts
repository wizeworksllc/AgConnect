'use client';

import { useCallback, useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import type { LinkedAccount, LinkedAccounts } from './types';

export function useLinkedAccounts(userId: string | null): LinkedAccounts {
    const [accounts, setAccounts] = useState<LinkedAccount[] | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        authClient
            .listAccounts()
            .then(({ data }) => {
                if (!cancelled) setAccounts((data ?? []) as LinkedAccount[]);
            })
            .catch(() => {
                if (!cancelled) setAccounts([]);
            });
        return () => {
            cancelled = true;
        };
    }, [userId, reloadKey]);

    const reload = useCallback(() => setReloadKey((k) => k + 1), []);

    return {
        accounts,
        hasPassword: Boolean(accounts?.some((a) => a.providerId === 'credential')),
        reload,
    };
}
