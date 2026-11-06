import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faStar } from '@fortawesome/free-solid-svg-icons';
import { Wordmark } from '@/components/primitives/Wordmark';

export function HeroDesktopMockup() {
    const t = useTranslations('landing.hero.phone');

    return (
        <div className="mockup-window border-base-300 bg-base-100 w-full border shadow-2xl">
            <div className="border-base-300 bg-base-200 flex items-center gap-3 border-t px-4 py-2">
                <div className="border-base-300 bg-base-100 flex flex-1 items-center gap-2 border px-3 py-1.5">
                    <FontAwesomeIcon icon={faLock} className="text-secondary text-[10px]" />
                    <span className="text-secondary font-mono text-xs">agconn.com/jobs</span>
                </div>
                <Wordmark size="sm" tone="ink" />
            </div>

            <div className="grid grid-cols-[180px_1fr]">
                <div className="border-base-300 flex flex-col gap-4 border-r p-4" aria-hidden>
                    <p className="text-base-content font-sans text-sm font-semibold">{t('counties')}</p>
                    <ul className="flex flex-col gap-1 font-sans text-sm">
                        <li className="bg-primary text-primary-content px-3 py-1.5">Fresno</li>
                        <li className="text-base-content px-3 py-1.5">Tulare</li>
                        <li className="text-base-content px-3 py-1.5">Kern</li>
                        <li className="text-base-content px-3 py-1.5">Madera</li>
                        <li className="text-base-content px-3 py-1.5">Kings</li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3 p-4">
                    <div className="flex items-center justify-between pb-1">
                        <p className="text-base-content font-serif text-lg font-semibold tracking-tight">
                            {t('jobs_near')}
                        </p>
                    </div>

                    <article className="card card-bordered border-base-300 bg-base-100">
                        <div className="card-body p-3 gap-2">
                            <div className="flex items-center justify-between">
                                <div className="badge badge-primary gap-1.5">
                                    <FontAwesomeIcon icon={faStar} className="text-accent text-[10px]" />
                                    <span className="text-xs font-semibold tracking-wider">
                                        {t('verified_flc')}
                                    </span>
                                </div>
                                <span className="text-secondary font-mono text-xs">{t('distance')}</span>
                            </div>
                            <p className="text-base-content font-serif text-base font-semibold leading-tight">
                                {t('job_title')}
                            </p>
                            <p className="text-secondary font-sans text-xs">{t('employer')}</p>
                            <div className="border-base-300 mt-1 flex items-center justify-between border-t pt-2">
                                <span className="text-primary font-serif text-sm font-semibold">{t('wage')}</span>
                                <span className="btn btn-primary pointer-events-none" aria-hidden>
                                    {t('apply')}
                                </span>
                            </div>
                        </div>
                    </article>

                    <article className="card card-bordered border-base-300 bg-base-100">
                        <div className="card-body p-3 gap-2">
                            <div className="flex items-center justify-between">
                                <span className="badge badge-accent text-xs font-semibold tracking-wider">
                                    {t('training_label')}
                                </span>
                                <span className="text-secondary font-mono text-xs">{t('spots')}</span>
                            </div>
                            <p className="text-base-content font-serif text-base font-semibold leading-tight">
                                {t('training_title')}
                            </p>
                            <p className="text-secondary font-sans text-xs">{t('training_meta')}</p>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}
