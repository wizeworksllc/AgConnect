'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { authClient } from '@/lib/auth-client';
import { SectionCard, StatusBadge } from './SectionCard';
import { PasswordPrompt } from './PasswordPrompt';
import { TotpSetupForm } from './TotpSetupForm';
import { BackupCodesList } from './BackupCodesList';
import { useAction } from './useAction';
import type { CurrentUser } from './types';

type Props = { user: CurrentUser; hasPassword: boolean; refetch: () => void };
type PasswordAction = 'enable' | 'disable' | 'regen';
type Setup = { uri: string; backupCodes: string[] };

export function TwoStepVerificationSection({ user, hasPassword, refetch }: Props) {
    const t = useTranslations('employer.account.tsv');
    const { busy, error, run } = useAction();
    const [action, setAction] = useState<PasswordAction | null>(null);
    const [setup, setSetup] = useState<Setup | null>(null);
    const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
    const enabled = user.twoFactorEnabled;

    async function onPassword(password: string) {
        if (!action) return;
        const ok = await run(action, async () => {
            if (action === 'enable') {
                const res = await authClient.twoFactor.enable({ password });
                if (res.data?.method === 'totp') {
                    setSetup({ uri: res.data.totpURI, backupCodes: res.data.backupCodes });
                }
                return res;
            }
            if (action === 'disable') return authClient.twoFactor.disable({ password });
            const res = await authClient.twoFactor.generateBackupCodes({ password });
            if (res.data) setBackupCodes(res.data.backupCodes);
            return res;
        });
        if (!ok) return;
        if (action === 'disable') {
            setBackupCodes(null);
            refetch();
        }
        setAction(null);
    }

    async function onVerify(code: string) {
        if (!setup) return;
        const ok = await run('verify', () => authClient.twoFactor.verifyTotp({ code }));
        if (!ok) return;
        setBackupCodes(setup.backupCodes);
        setSetup(null);
        refetch();
    }

    const idle = !action && !setup;

    return (
        <SectionCard heading={t('heading')} subtitle={t('subtitle')}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <FontAwesomeIcon
                    icon={faShieldHalved}
                    className={enabled ? 'text-success h-5 w-5' : 'text-base-content/50 h-5 w-5'}
                />
                <span className="text-sm">{enabled ? t('enabled') : t('disabled')}</span>
                <StatusBadge
                    tone={enabled ? 'verified' : 'unverified'}
                    label={enabled ? t('enabled') : t('disabled')}
                />
            </div>

            {!hasPassword && !enabled && (
                <p className="text-base-content/70 text-sm">{t('need_password')}</p>
            )}

            {hasPassword && !enabled && idle && (
                <button
                    type="button"
                    className="btn btn-sm btn-primary rounded-full"
                    onClick={() => setAction('enable')}
                >
                    {t('add_cta')}
                </button>
            )}

            {action && (
                <PasswordPrompt
                    label={t('password_label')}
                    submitLabel={t('continue')}
                    busy={busy === action}
                    onSubmit={onPassword}
                    onCancel={() => setAction(null)}
                />
            )}

            {setup && (
                <TotpSetupForm
                    uri={setup.uri}
                    busy={busy === 'verify'}
                    onVerify={onVerify}
                    onCancel={() => setSetup(null)}
                />
            )}

            {backupCodes && backupCodes.length > 0 && <BackupCodesList codes={backupCodes} />}

            {hasPassword && enabled && idle && (
                <div className="border-base-300 mt-5 flex flex-wrap gap-2 border-t pt-5">
                    <button
                        type="button"
                        className="btn btn-sm border-base-300 rounded-full border bg-transparent"
                        onClick={() => setAction('regen')}
                    >
                        {t('regenerate_codes')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm text-error/90 rounded-full border-transparent bg-transparent"
                        onClick={() => setAction('disable')}
                    >
                        {t('remove_cta')}
                    </button>
                </div>
            )}

            {error && <p className="label text-error mt-3">{error}</p>}
        </SectionCard>
    );
}
