'use client';

import { useState, type FormEvent } from 'react';
import { authClient } from '@/lib/auth-client';

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; email: string } | { kind: 'error'; message: string };

// Staff sign in by a one-time email link. The link only works for an account made with
// `pnpm --filter @agconn/db admin:create`; the server never creates one here.
export function MagicLinkForm() {
    const [email, setEmail] = useState('');
    const [state, setState] = useState<State>({ kind: 'idle' });

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setState({ kind: 'sending' });
        const { error } = await authClient.signIn.magicLink({
            email: email.trim(),
            callbackURL: `${window.location.origin}/`,
            errorCallbackURL: `${window.location.origin}/forbidden`,
        });
        setState(error ? { kind: 'error', message: error.message ?? 'Could not send the link.' } : { kind: 'sent', email: email.trim() });
    }

    return (
        <div className="bg-base-100 border-base-300 w-full max-w-sm rounded-box border p-8 shadow-[var(--shadow-card)]">
            <p className="eyebrow text-primary">AGCONN Admin</p>
            <h1 className="mt-2 font-serif text-2xl font-medium">Sign in</h1>
            {state.kind === 'sent' ? (
                <p className="text-base-content/70 mt-4 text-sm leading-relaxed" role="status">
                    We sent a sign-in link to <span className="font-medium">{state.email}</span>. It works once and
                    expires in 5 minutes.
                </p>
            ) : (
                <form onSubmit={onSubmit} className="mt-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Work email</legend>
                        <input
                            type="email"
                            className="input w-full"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </fieldset>
                    {state.kind === 'error' && (
                        <p className="text-error mt-2 text-sm" role="alert">
                            {state.message}
                        </p>
                    )}
                    <button
                        type="submit"
                        className="btn btn-primary mt-4 w-full rounded-full"
                        disabled={state.kind === 'sending'}
                    >
                        {state.kind === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
                    </button>
                </form>
            )}
        </div>
    );
}
