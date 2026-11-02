'use client';

import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { authClient } from '@/lib/auth-client';
import { SectionCard } from './SectionCard';
import { useAction } from './useAction';
import type { CurrentUser } from './types';

type Props = { user: CurrentUser; refetch: () => void };

export function ProfilePhotoSection({ user, refetch }: Props) {
    const t = useTranslations('employer.account.profile_photo');
    const { busy, error, run } = useAction();

    async function onRemove() {
        const ok = await run('remove', () => authClient.updateUser({ image: null }));
        if (ok) refetch();
    }

    return (
        <SectionCard heading={t('heading')} subtitle={t('subtitle')}>
            <div className="flex items-center gap-5">
                {user.image ? (
                    <img
                        src={user.image}
                        alt=""
                        className="border-base-300 h-24 w-24 shrink-0 rounded-full border object-cover"
                    />
                ) : (
                    <div className="border-base-300 bg-base-200 flex h-24 w-24 shrink-0 items-center justify-center rounded-full border">
                        <FontAwesomeIcon icon={faUser} className="text-base-content/40 h-9 w-9" />
                    </div>
                )}
                {user.image ? (
                    <button
                        type="button"
                        className="btn btn-sm border-base-300 rounded-full border bg-transparent"
                        disabled={busy === 'remove'}
                        onClick={onRemove}
                    >
                        {t('remove')}
                    </button>
                ) : (
                    <p className="text-base-content/60 text-sm">{t('empty')}</p>
                )}
            </div>
            {error && <p className="label text-error mt-3">{error}</p>}
        </SectionCard>
    );
}
