'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
    sentTo: string;
    busy: boolean;
    onSubmit: (code: string) => void;
    onResend: () => void;
    onCancel: () => void;
};

export function CodeForm({ sentTo, busy, onSubmit, onResend, onCancel }: Props) {
    const t = useTranslations('employer.account');
    const [code, setCode] = useState('');

    function submit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit(code.trim());
    }

    return (
        <form onSubmit={submit} className="border-base-300 mt-5 grid gap-3 border-t pt-5">
            <p className="text-base-content/80 text-sm">{t('code_sent', { target: sentTo })}</p>
            <fieldset className="fieldset w-full min-w-0">
                <legend className="fieldset-legend">{t('code_label')}</legend>
                <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="input w-full max-w-xs tabular-nums"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    autoFocus
                />
            </fieldset>
            <div className="flex flex-wrap gap-2">
                <button
                    type="submit"
                    className="btn btn-sm btn-primary rounded-full"
                    disabled={busy || code.trim().length < 6}
                >
                    {t('verify')}
                </button>
                <button
                    type="button"
                    className="btn btn-sm border-base-300 rounded-full border bg-transparent"
                    onClick={onResend}
                    disabled={busy}
                >
                    {t('resend_code')}
                </button>
                <button
                    type="button"
                    className="btn btn-sm rounded-full border-transparent bg-transparent"
                    onClick={onCancel}
                    disabled={busy}
                >
                    {t('cancel')}
                </button>
            </div>
        </form>
    );
}
