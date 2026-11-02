'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import { useAction } from './useAction';

type Props = {
    hasPassword: boolean;
    locale: string;
    businessName: string;
    onClose: () => void;
};

export function DeleteAccountModal({ hasPassword, locale, businessName, onClose }: Props) {
    const t = useTranslations('employer.account');
    const tDanger = useTranslations('employer.account.danger');
    const { busy, error, run } = useAction();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [typed, setTyped] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    const target = businessName.trim().toLowerCase();
    const matches = typed.trim().toLowerCase() === target && target.length > 0;
    const ready = matches && (!hasPassword || password.length > 0);

    async function onConfirm() {
        if (!ready) return;
        const ok = await run('delete', () =>
            authClient.deleteUser(hasPassword ? { password } : {}),
        );
        if (ok) window.location.assign(`/${locale}`);
    }

    return (
        <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
            <div className="modal-box border-error/30 max-w-md border">
                <h2 className="font-display text-xl font-normal leading-tight">
                    {tDanger('delete_modal_title')}
                </h2>
                <p className="text-base-content/80 mt-3 text-sm">{tDanger('delete_modal_body')}</p>
                <div role="alert" className="border-error/30 bg-error/5 mt-4 rounded-xl border p-3">
                    <p className="text-error text-sm font-semibold">{t('delete_warning_title')}</p>
                    <p className="text-base-content/80 mt-1 text-sm">{t('delete_warning_body')}</p>
                </div>
                <fieldset className="fieldset mt-5 w-full min-w-0">
                    <legend className="fieldset-legend">
                        {tDanger('delete_modal_confirm_label', { name: businessName })}
                    </legend>
                    <input
                        type="text"
                        className="input w-full"
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        placeholder={tDanger('delete_modal_confirm_placeholder')}
                        autoComplete="off"
                        autoFocus
                    />
                </fieldset>
                {hasPassword && (
                    <fieldset className="fieldset w-full min-w-0">
                        <legend className="fieldset-legend">{tDanger('password_label')}</legend>
                        <input
                            type="password"
                            className="input w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </fieldset>
                )}
                {error && <p className="label text-error mt-3">{error}</p>}
                <div className="modal-action">
                    <button
                        type="button"
                        className="btn btn-sm border-base-300 rounded-full border bg-transparent"
                        onClick={onClose}
                        disabled={busy === 'delete'}
                    >
                        {t('cancel')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-error rounded-full"
                        onClick={onConfirm}
                        disabled={!ready || busy === 'delete'}
                    >
                        {tDanger('delete_button')}
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit" aria-label={t('cancel')}>
                    {t('cancel')}
                </button>
            </form>
        </dialog>
    );
}
