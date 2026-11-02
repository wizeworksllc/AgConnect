'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
    uri: string;
    busy: boolean;
    onVerify: (code: string) => void;
    onCancel: () => void;
};

function secretFromUri(uri: string): string {
    try {
        return new URL(uri).searchParams.get('secret') ?? '';
    } catch {
        return '';
    }
}

export function TotpSetupForm({ uri, busy, onVerify, onCancel }: Props) {
    const t = useTranslations('employer.account.tsv');
    const tAcc = useTranslations('employer.account');
    const [code, setCode] = useState('');
    const secret = secretFromUri(uri);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        onVerify(code.trim());
    }

    return (
        <form onSubmit={submit} className="border-base-300 mt-2 grid gap-4 border-t pt-5">
            <p className="text-base-content/80 text-sm">{t('qr_instructions')}</p>
            <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(uri)}`}
                alt=""
                className="border-base-300 h-44 w-44 rounded-xl border bg-white p-2"
            />
            {secret && (
                <fieldset className="fieldset w-full min-w-0 max-w-sm">
                    <legend className="fieldset-legend">{t('secret_label')}</legend>
                    <kbd className="kbd font-mono break-all text-xs">{secret}</kbd>
                </fieldset>
            )}
            <fieldset className="fieldset w-full min-w-0 max-w-xs">
                <legend className="fieldset-legend">{t('code_label')}</legend>
                <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="input w-full tabular-nums"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                />
            </fieldset>
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="btn btn-sm btn-primary rounded-full"
                    disabled={busy || code.length < 6}
                >
                    {t('verify')}
                </button>
                <button
                    type="button"
                    className="btn btn-sm rounded-full border-transparent bg-transparent"
                    onClick={onCancel}
                    disabled={busy}
                >
                    {tAcc('cancel')}
                </button>
            </div>
        </form>
    );
}
