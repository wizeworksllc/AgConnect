'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import { SectionCard } from './SectionCard';
import { useAction } from './useAction';
import type { CurrentUser } from './types';

type Props = { user: CurrentUser; refetch: () => void };

export function PersonalInfoSection({ user, refetch }: Props) {
    const t = useTranslations('employer.account.personal_info');
    const { busy, error, setError, run } = useAction();
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [success, setSuccess] = useState(false);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const dirty = fullName !== user.name;

    async function onSave(e: React.FormEvent) {
        e.preventDefault();
        setSuccess(false);
        if (firstName.length > 64 || lastName.length > 64) {
            setError(t('too_long'));
            return;
        }
        const ok = await run('save', () => authClient.updateUser({ name: fullName }));
        if (!ok) return;
        setSuccess(true);
        refetch();
    }

    return (
        <SectionCard heading={t('heading')} subtitle={t('subtitle')}>
            <form onSubmit={onSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <fieldset className="fieldset w-full min-w-0">
                    <legend className="fieldset-legend">{t('first_name')}</legend>
                    <input
                        type="text"
                        className="input w-full"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="given-name"
                        maxLength={64}
                    />
                </fieldset>
                <fieldset className="fieldset w-full min-w-0">
                    <legend className="fieldset-legend">{t('last_name')}</legend>
                    <input
                        type="text"
                        className="input w-full"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        autoComplete="family-name"
                        maxLength={64}
                    />
                </fieldset>

                {error && <p className="label text-error sm:col-span-2">{error}</p>}
                {success && !error && (
                    <p className="label text-success sm:col-span-2">{t('save_success')}</p>
                )}

                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        className="btn btn-sm btn-primary rounded-full"
                        disabled={busy === 'save' || !dirty || fullName.length === 0}
                    >
                        {t('save')}
                    </button>
                </div>
            </form>
        </SectionCard>
    );
}
