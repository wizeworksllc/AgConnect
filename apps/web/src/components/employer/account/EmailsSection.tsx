'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import { SectionCard, StatusBadge } from './SectionCard';
import { CodeForm } from './CodeForm';
import { useAction } from './useAction';
import type { CurrentUser } from './types';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = { user: CurrentUser; refetch: () => void };
type Pending = { kind: 'verify' | 'change'; email: string };

export function EmailsSection({ user, refetch }: Props) {
    const t = useTranslations('employer.account.emails');
    const tAcc = useTranslations('employer.account');
    const { busy, error, setError, run } = useAction();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const [pending, setPending] = useState<Pending | null>(null);

    const sendCode = (p: Pending) =>
        run('send', () =>
            p.kind === 'verify'
                ? authClient.emailOtp.sendVerificationOtp({ email: p.email, type: 'email-verification' })
                : authClient.emailOtp.requestEmailChange({ newEmail: p.email }),
        );

    async function start(p: Pending) {
        if (await sendCode(p)) {
            setPending(p);
            setEditing(false);
            setDraft('');
        }
    }

    function onChange(e: React.FormEvent) {
        e.preventDefault();
        const email = draft.trim().toLowerCase();
        if (!EMAIL_RX.test(email)) {
            setError(t('invalid'));
            return;
        }
        void start({ kind: 'change', email });
    }

    async function onCode(otp: string) {
        if (!pending) return;
        const { kind, email } = pending;
        const ok = await run('verify', () =>
            kind === 'verify'
                ? authClient.emailOtp.verifyEmail({ email, otp })
                : authClient.emailOtp.changeEmail({ newEmail: email, otp }),
        );
        if (!ok) return;
        setPending(null);
        refetch();
    }

    const showForm = !pending && (editing || !user.email);

    return (
        <SectionCard heading={t('heading')} subtitle={t('subtitle')}>
            {user.email ? (
                <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="text-base-content truncate text-sm font-medium">{user.email}</div>
                        <div className="mt-1">
                            <StatusBadge
                                tone={user.emailVerified ? 'verified' : 'unverified'}
                                label={user.emailVerified ? t('verified_badge') : t('unverified_badge')}
                            />
                        </div>
                    </div>
                    {!pending && !editing && (
                        <div className="flex flex-wrap gap-2">
                            {!user.emailVerified && (
                                <button
                                    type="button"
                                    className="btn btn-xs border-base-300 rounded-full border bg-transparent"
                                    onClick={() => void start({ kind: 'verify', email: user.email ?? '' })}
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
                    sentTo={pending.email}
                    busy={busy !== null}
                    onSubmit={onCode}
                    onResend={() => void sendCode(pending)}
                    onCancel={() => setPending(null)}
                />
            )}

            {showForm && (
                <form onSubmit={onChange} className="border-base-300 mt-5 flex flex-wrap gap-2 border-t pt-5">
                    <fieldset className="fieldset w-full min-w-0 flex-1">
                        <legend className="fieldset-legend">
                            {user.email ? t('change_label') : t('heading')}
                        </legend>
                        <input
                            type="email"
                            className="input w-full"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder={t('add_placeholder')}
                            autoComplete="email"
                        />
                    </fieldset>
                    <div className="flex gap-2 self-end">
                        <button
                            type="submit"
                            className="btn btn-sm btn-primary rounded-full"
                            disabled={busy === 'send' || draft.trim().length === 0}
                        >
                            {user.email ? t('change') : t('add')}
                        </button>
                        {user.email && (
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
