'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import { useAction } from './useAction';

type Props = { email: string | null; locale: string };

export function SetPasswordPanel({ email, locale }: Props) {
    const t = useTranslations('employer.account.password');
    const { busy, error, run } = useAction();
    const [sentTo, setSentTo] = useState<string | null>(null);

    if (!email) {
        return <p className="text-base-content/70 text-sm">{t('need_email')}</p>;
    }

    async function onSend() {
        if (!email) return;
        const ok = await run('send', () =>
            authClient.requestPasswordReset({
                email,
                redirectTo: `${window.location.origin}/${locale}/reset-password`,
            }),
        );
        if (ok) setSentTo(email);
    }

    return (
        <div className="grid gap-3 sm:max-w-md">
            <p className="text-base-content/70 text-sm">{t('none_body')}</p>
            {sentTo ? (
                <p className="label text-success">{t('set_sent', { email: sentTo })}</p>
            ) : (
                <div>
                    <button
                        type="button"
                        className="btn btn-sm btn-primary rounded-full"
                        onClick={onSend}
                        disabled={busy === 'send'}
                    >
                        {t('set_cta')}
                    </button>
                </div>
            )}
            {error && <p className="label text-error">{error}</p>}
        </div>
    );
}
