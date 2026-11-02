'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileScreen, faDesktop } from '@fortawesome/free-solid-svg-icons';
import { authClient } from '@/lib/auth-client';
import { SectionCard, StatusBadge } from './SectionCard';
import { useAction } from './useAction';
import { describeUserAgent } from './userAgent';

type Props = { locale: string };

type SessionRow = {
    token: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    updatedAt: Date | string;
};

function formatRelative(date: Date, locale: string): string {
    const minutes = Math.round((Date.now() - date.getTime()) / 60_000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour');
    return rtf.format(-Math.round(hours / 24), 'day');
}

export function ActiveDevicesSection({ locale }: Props) {
    const t = useTranslations('employer.account.devices');
    const tAcc = useTranslations('employer.account');
    const currentToken = authClient.useSession().data?.session.token;
    const { busy, error, setError, run } = useAction();
    const [rows, setRows] = useState<SessionRow[] | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        authClient
            .listSessions()
            .then(({ data, error: err }) => {
                if (cancelled) return;
                if (err) setError(tAcc('error_generic'));
                setRows((data ?? []) as SessionRow[]);
            })
            .catch(() => {
                if (!cancelled) setRows([]);
            });
        return () => {
            cancelled = true;
        };
    }, [reloadKey, setError, tAcc]);

    async function onRevoke(token: string) {
        if (await run(token, () => authClient.revokeSession({ token }))) setReloadKey((k) => k + 1);
    }

    async function onRevokeOthers() {
        if (await run('others', () => authClient.revokeOtherSessions())) setReloadKey((k) => k + 1);
    }

    const others = rows?.filter((r) => r.token !== currentToken) ?? [];

    return (
        <SectionCard heading={t('heading')} subtitle={t('subtitle')}>
            {rows === null ? (
                <div className="bg-base-200 h-12 w-full animate-pulse rounded" />
            ) : rows.length === 0 ? (
                <p className="text-base-content/60 text-sm">{t('empty')}</p>
            ) : (
                <ul className="divide-base-300 divide-y">
                    {rows.map((row) => {
                        const isCurrent = row.token === currentToken;
                        const device = describeUserAgent(row.userAgent);
                        return (
                            <li key={row.token} className="flex flex-wrap items-center gap-3 py-3">
                                <FontAwesomeIcon
                                    icon={device.isMobile ? faMobileScreen : faDesktop}
                                    className="text-base-content/70 h-5 w-5"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="text-base-content truncate text-sm font-medium">
                                        {device.label ?? t('unknown_browser')}
                                    </div>
                                    <div className="text-base-content/60 mt-0.5 truncate text-xs tabular-nums">
                                        {row.ipAddress || t('unknown_location')} ·{' '}
                                        {t('last_active', {
                                            when: formatRelative(new Date(row.updatedAt), locale),
                                        })}
                                    </div>
                                    {isCurrent && (
                                        <div className="mt-1">
                                            <StatusBadge tone="primary" label={t('current_label')} />
                                        </div>
                                    )}
                                </div>
                                {!isCurrent && (
                                    <button
                                        type="button"
                                        className="btn btn-xs text-error/90 rounded-full border-transparent bg-transparent"
                                        onClick={() => onRevoke(row.token)}
                                        disabled={busy === row.token}
                                    >
                                        {t('signout_other')}
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
            {others.length > 1 && (
                <div className="border-base-300 mt-3 border-t pt-4">
                    <button
                        type="button"
                        className="btn btn-sm border-base-300 rounded-full border bg-transparent"
                        onClick={onRevokeOthers}
                        disabled={busy === 'others'}
                    >
                        {t('signout_all')}
                    </button>
                </div>
            )}
            {error && <p className="label text-error mt-3">{error}</p>}
        </SectionCard>
    );
}
