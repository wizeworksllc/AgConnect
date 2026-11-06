import { useLocale, useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { HeroPhoneMockup } from './HeroPhoneMockup';
import { HeroDesktopMockup } from './HeroDesktopMockup';
import { HeroTrustStrip } from './HeroTrustStrip';

export function Hero() {
    const t = useTranslations('landing.hero');
    const tRoot = useTranslations('landing');
    const locale = useLocale();

    return (
        <section id="main" className="bg-base-100 w-full">
            <div className="container mx-auto grid grid-cols-1 gap-12 px-5 pt-16 pb-20 md:px-8 md:pt-20 md:pb-24 lg:grid-cols-2 lg:gap-12 lg:px-20 lg:pt-24 lg:pb-28">
                <div className="flex flex-col gap-9 lg:pt-6">
                    <h1 className="text-base-content font-serif text-5xl font-semibold leading-tight tracking-tight sm:text-6xl md:text-6xl lg:text-7xl">
                        {t('headline')}
                    </h1>

                    <p className="text-base-content  font-sans text-lg leading-relaxed md:text-xl">
                        {t('subhead')}
                    </p>

                    <p className="font-sans text-base font-semibold">{t('now_serving')}</p>

                    <div className="flex flex-wrap gap-3.5 pt-2">
                        <a href={`/${locale}/worker/sign-up`} className="btn btn-primary btn-lg">
                            {t('cta.primary')}
                            <FontAwesomeIcon icon={faArrowRight} className="text-base" />
                        </a>
                        <a href={`/${locale}/employer/sign-up`} className="btn btn-outline btn-primary btn-lg">
                            {t('cta.secondary')}
                        </a>
                    </div>

                    <HeroTrustStrip />
                </div>

                <div className="flex flex-col items-center justify-center gap-3 pt-6 lg:pt-12">
                    <div className="lg:hidden">
                        <HeroPhoneMockup />
                    </div>
                    <div className="hidden w-full lg:block">
                        <HeroDesktopMockup />
                    </div>
                    <p className="text-secondary font-sans text-sm">{tRoot('sample_note')}</p>
                </div>
            </div>
        </section>
    );
}
