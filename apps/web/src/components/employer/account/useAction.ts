'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authErrorMessage } from '@/lib/auth-client';

type AuthResult = { error?: unknown } | void;

// Runs one auth call at a time per section and turns its { error } into display copy.
export function useAction() {
    const tAcc = useTranslations('employer.account');
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function run(key: string, fn: () => Promise<AuthResult>): Promise<boolean> {
        setBusy(key);
        setError(null);
        try {
            const res = await fn();
            if (res && res.error) {
                setError(authErrorMessage(res.error, tAcc('error_generic')));
                return false;
            }
            return true;
        } catch (err) {
            setError(authErrorMessage(err, tAcc('error_generic')));
            return false;
        } finally {
            setBusy(null);
        }
    }

    return { busy, error, setError, run };
}
