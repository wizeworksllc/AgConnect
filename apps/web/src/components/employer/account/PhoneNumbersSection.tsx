'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { normalizeUsPhone } from '@agconn/schemas';
import { authClient } from '@/lib/auth-client';
import { SectionCard, StatusBadge } from './SectionCard';
import { CodeForm } from './CodeForm';
import { useAction } from './useAction';
import type { CurrentUser } from './types';

type Props = { user: CurrentUser; refetch: () => void };

export function PhoneNumbersSection({ user, refetch }: Props) {
    const t = useTranslations('employer.account.phones');
    const tAcc = useTranslations('employer.account');
    const { busy, error, setError, run } = useAction();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const [pending, setPending] = useState<string | null>(null);

    const sendCode = (phoneNumber: string) =>
        run('send', () => authClient.phoneNumber.sendOtp({ phoneNumber }));

    async function start(phoneNumber: string) {
        if (await sendCode(phoneNumber)) {
            setPending(phoneNumber);
            setEditing(false);
            setDraft('');
        }
    }

    function onAdd(e: React.FormEvent) {
        e.preventDefault();
        const phone = normalizeUsPhone(draft);
        if (!phone) {
            setError(t('invalid'));
            return;
        }
        void start(phone);
    }

    async function onCode(code: string) {
        if (!pending) return;
        const phoneNumber = pending;
        // updatePhoneNumber rejects a number already on any account, this one included.
        const ok = await run('verify', () =>
            phoneNumber === user.phone
                ? authClient.phoneNumber.verify({ phoneNumber, code, disableSession: true })
                : authClient.phoneNumber.verify({ phoneNumber, code, updatePhoneNumber: true }),
        );
        if (!ok) return;
        setPending(null);
        refetch();
    }

    const showForm = !pending && (editing || !user.phone);

    return (
        <SectionCard heading={t('heading')} subtitle={t('subtitle')}>
            {user.phone ? (
                <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="text-base-content truncate text-sm font-medium tabular-nums">
                            {user.phone}
                        </div>
                        <div className="mt-1">
                            <StatusBadge
                                tone={user.phoneVerified ? 'verified' : 'unverified'}
                                label={user.phoneVerified ? tAcc('emails.verified_badge') : tAcc('emails.unverified_badge')}
                            />
                        </div>
                    </div>
                    {!pending && !editing && (
                        <div className="flex flex-wrap gap-2">
                            {!user.phoneVerified && (
                                <button
                                    type="button"
                                    className="btn btn-xs border-base-300 rounded-full border bg-transparent"
                                    onClick={() => void start(user.phone ?? '')}
                                    disabled={busy === 'send'}
                                >
                                    {tAcc('send_code')}
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn btn-xs border-base-300 rounded-full border bg-transparent"
                                onClick={() => setEditing(true)}
                            >
                                {t('change')}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-base-content/60 text-sm">{t('empty')}</p>
            )}

            {pending && (
                <CodeForm
                    sentTo={pending}
                    busy={busy !== null}
                    onSubmit={onCode}
                    onResend={() => void sendCode(pending)}
                    onCancel={() => setPending(null)}
                />
            )}

            {showForm && (
                <form onSubmit={onAdd} className="border-base-300 mt-5 flex flex-wrap gap-2 border-t pt-5">
                    <fieldset className="fieldset w-full min-w-0 flex-1">
                        <legend className="fieldset-legend">
                            {user.phone ? t('change_label') : t('heading')}
                        </legend>
                        <input
                            type="tel"
                            className="input w-full"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder={t('add_placeholder')}
                            autoComplete="tel"
                        />
                    </fieldset>
                    <div className="flex gap-2 self-end">
                        <button
                            type="submit"
                            className="btn btn-sm btn-primary rounded-full"
                            disabled={busy === 'send' || draft.trim().length === 0}
                        >
                            {tAcc('send_code')}
                        </button>
                        {user.phone && (
                            <button
                                type="button"
                                className="btn btn-sm rounded-full border-transparent bg-transparent"
                                onClick={() => setEditing(false)}
                            >
                                {tAcc('cancel')}
                            </button>
                        )}
                    </div>
                </form>
            )}

            {error && <p className="label text-error mt-3">{error}</p>}
        </SectionCard>
    );
}
