import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const fields = [
    { id: 'license', value: 'FLC-000000' },
    { id: 'issued', value: '2026-01-01' },
    { id: 'expires', value: '2027-01-01' },
    { id: 'mspa', value: 'MSPA-000000' },
] as const;

export function VerificationCard() {
    const t = useTranslations('landing.verification.card');

    return (
        <div className="border-base-300 flex w-full flex-col gap-6 border bg-base-100 p-12 shadow-xl">
            <p className="text-secondary font-sans text-sm font-semibold">{t('record')}</p>

            <div className="flex items-start gap-4">
                <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="text-primary text-[56px] shrink-0"
                />
                <div className="flex flex-col gap-1.5">
                    <p className="text-base-content font-serif text-3xl font-semibold leading-tight tracking-tight">
                        {t('name')}
                    </p>
                    <p className="text-secondary font-sans text-sm">{t('checked')}</p>
                </div>
            </div>

            <div className="border-base-300 flex flex-col border">
                <div className="bg-base-200 flex items-center px-4 py-3">
                    <span className="text-secondary flex-1 font-sans text-sm font-semibold">{t('field')}</span>
                    <span className="text-secondary flex-[1.5] font-sans text-sm font-semibold">{t('value')}</span>
                </div>
                {fields.map((f) => (
                    <div key={f.id} className="border-base-300 flex items-center border-t px-4 py-3">
                        <span className="text-secondary flex-1 font-sans text-sm">{t(f.id)}</span>
                        <span className="text-base-content flex-[1.5] font-mono text-sm">{f.value}</span>
                    </div>
                ))}
                <div className="border-base-300 flex items-center border-t px-4 py-3">
                    <span className="text-secondary flex-1 font-sans text-sm">{t('status')}</span>
                    <div className="flex-[1.5]">
                        <span className="badge badge-primary font-semibold">{t('verified')}</span>
                    </div>
                </div>
            </div>

            <p className="border-base-300 border-t pt-3.5 text-secondary font-sans text-sm leading-snug">
                {t('note')}
            </p>
        </div>
    );
}
