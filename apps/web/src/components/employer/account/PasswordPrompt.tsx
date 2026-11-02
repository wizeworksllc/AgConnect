'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
    label: string;
    submitLabel: string;
    busy: boolean;
    onSubmit: (password: string) => void;
    onCancel: () => void;
};

export function PasswordPrompt({ label, submitLabel, busy, onSubmit, onCancel }: Props) {
    const t = useTranslations('employer.account');
    const [password, setPassword] = useState('');

    function submit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit(password);
    }

    return (
        <form onSubmit={submit} className="border-base-300 mt-2 grid gap-3 border-t pt-5">
            <fieldset className="fieldset w-full min-w-0 max-w-sm">
                <legend className="fieldset-legend">{label}</legend>
                <input
                    type="password"
                    className="input w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    autoFocus
                />
            </fieldset>
            <div className="flex flex-wrap gap-2">
                <button
                    type="submit"
                    className="btn btn-sm btn-primary rounded-full"
                    disabled={busy || password.length === 0}
                >
                    {submitLabel}
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
