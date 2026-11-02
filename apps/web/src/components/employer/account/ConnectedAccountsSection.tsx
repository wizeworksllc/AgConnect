'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faMicrosoft, faApple } from '@fortawesome/free-brands-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { authClient, fetchSocialProviders } from '@/lib/auth-client';
import { SectionCard } from './SectionCard';
import { useAction } from './useAction';
import type { LinkedAccounts } from './types';

type ProviderKey = 'google' | 'microsoft' | 'apple';

const PROVIDERS: { key: ProviderKey; icon: IconDefinition; labelKey: `connect_${ProviderKey}`; title: string }[] = [
    { key: 'google', icon: faGoogle, labelKey: 'connect_google', title: 'Google' },
    { key: 'microsoft', icon: faMicrosoft, labelKey: 'connect_microsoft', title: 'Microsoft' },
    { key: 'apple', icon: faApple, labelKey: 'connect_apple', title: 'Apple' },
];

type Props = { linked: LinkedAccounts; locale: string };

export function ConnectedAccountsSection({ linked, locale }: Props) {
    const t = useTranslations('employer.account.connected');
    const { busy, error, setError, run } = useAction();
    const [enabled, setEnabled] = useState<string[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        void fetchSocialProviders().then((ids) => {
            if (!cancelled) setEnabled(ids);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    async function onConnect(provider: ProviderKey) {
        const ok = await run(provider, () =>
            authClient.linkSocial({
                provider,
                callbackURL: `${window.location.origin}/${locale}/employer/account`,
            }),
        );
        if (!ok) setError(t('error'));
    }

    async function onDisconnect(provider: ProviderKey, accountId: string) {
        const ok = await run(provider, () => authClient.unlinkAccount({ accountId }));
        if (ok) linked.reload();
    }

    const providers = PROVIDERS.filter((p) => enabled?.includes(p.key));
    if (enabled !== null && providers.length === 0) return null;

    const accounts = linked.accounts ?? [];
    const connectedCount = providers.filter((p) => accounts.some((a) => a.providerId === p.key)).length;

    return (
        <SectionCard heading={t('heading')} subtitle={t('subtitle')}>
            {enabled === null ? (
                <div className="bg-base-200 h-12 w-full animate-pulse rounded" />
            ) : (
                <ul className="divide-base-300 divide-y">
                    {providers.map((p) => {
                        const connected = accounts.find((a) => a.providerId === p.key);
                        return (
                            <li key={p.key} className="flex flex-wrap items-center gap-3 py-3">
                                <FontAwesomeIcon icon={p.icon} className="text-base-content/70 h-5 w-5" />
                                <div className="min-w-0 flex-1">
                                    <div className="text-base-content text-sm font-medium">{p.title}</div>
                                    {connected && (
                                        <div className="text-base-content/60 text-xs">{t('connected')}</div>
                                    )}
                                </div>
                                {connected ? (
                                    <button
                                        type="button"
                                        className="btn btn-xs text-error/90 rounded-full border-transparent bg-transparent"
                                        disabled={busy === p.key}
                                        onClick={() => onDisconnect(p.key, connected.id)}
                                    >
                                        {t('disconnect')}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-sm border-base-300 rounded-full border bg-transparent"
                                        disabled={busy === p.key}
                                        onClick={() => onConnect(p.key)}
                                    >
                                        {t(p.labelKey)}
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
            {enabled !== null && connectedCount === 0 && (
                <p className="text-base-content/60 mt-3 text-xs">{t('empty')}</p>
            )}
            {error && <p className="label text-error mt-3">{error}</p>}
        </SectionCard>
    );
}
