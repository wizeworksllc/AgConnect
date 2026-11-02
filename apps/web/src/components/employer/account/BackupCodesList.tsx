'use client';

import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';

export function BackupCodesList({ codes }: { codes: string[] }) {
    const t = useTranslations('employer.account.tsv');
    return (
        <div className="border-base-300 mt-5 grid gap-2 border-t pt-5">
            <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faKey} className="text-base-content/70 h-4 w-4" />
                <h3 className="text-sm font-semibold">{t('backup_codes_title')}</h3>
            </div>
            <p className="text-base-content/70 text-xs">{t('backup_codes_save')}</p>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {codes.map((c) => (
                    <li key={c}>
                        <kbd className="kbd font-mono w-full justify-center text-xs">{c}</kbd>
                    </li>
                ))}
            </ul>
        </div>
    );
}
