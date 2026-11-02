'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import { SectionCard } from './SectionCard';
import { SetPasswordPanel } from './SetPasswordPanel';
import { useAction } from './useAction';
import type { CurrentUser } from './types';

// Matches minPasswordLength in services/api/src/auth/server.ts.
const MIN_LENGTH = 10;

type Props = { user: CurrentUser; hasPassword: boolean; locale: string };

export function PasswordSection({ user, hasPassword, locale }: Props) {
    const t = useTranslations('employer.account.password');
    const { busy, error, setError, run } = useAction();
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [success, setSuccess] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSuccess(false);
        if (next.length < MIN_LENGTH) {
            setError(t('too_short'));
            return;
        }
        if (next !== confirm) {
            setError(t('mismatch'));
            return;
        }
        const ok = await run('update', () =>
            authClient.changePassword({
                currentPassword: current,
                newPassword: next,
                revokeOtherSessions: true,
            }),
        );
        if (!ok) return;
        setSuccess(true);
        setCurrent('');
        setNext('');
        setConfirm('');
    }

    if (!hasPassword) {
        return (
            <SectionCard heading={t('heading')}>
                <SetPasswordPanel email={user.email} locale={locale} />
            </SectionCard>
        );
    }

    return (
        <SectionCard heading={t('heading')} subtitle={t('subtitle')}>
            <form onSubmit={onSubmit} className="grid gap-4 sm:max-w-md">
                <fieldset className="fieldset w-full min-w-0">
                    <legend className="fieldset-legend">{t('current')}</legend>
                    <input
                        type="password"
                        className="input w-full"
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                        autoComplete="current-password"
                    />
                </fieldset>
                <fieldset className="fieldset w-full min-w-0">
                    <legend className="fieldset-legend">{t('new')}</legend>
                    <input
                        type="password"
                        className="input w-full"
                        value={next}
                        onChange={(e) => setNext(e.target.value)}
                        autoComplete="new-password"
                        minLength={MIN_LENGTH}
                    />
                </fieldset>
                <fieldset className="fieldset w-full min-w-0">
                    <legend className="fieldset-legend">{t('confirm')}</legend>
                    <input
                        type="password"
                        className="input w-full"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        minLength={MIN_LENGTH}
                    />
                </fieldset>

                {error && <p className="label text-error">{error}</p>}
                {success && !error && <p className="label text-success">{t('update_success')}</p>}

                <div>
                    <button
                        type="submit"
                        className="btn btn-sm btn-primary rounded-full"
                        disabled={busy === 'update' || current.length === 0 || next.length === 0}
                    >
                        {t('update')}
                    </button>
                </div>
            </form>
        </SectionCard>
    );
}
