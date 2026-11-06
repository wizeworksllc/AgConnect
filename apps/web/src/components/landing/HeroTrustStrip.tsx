import { getTranslations } from 'next-intl/server';
import { getImpact } from '@/lib/api/landing';

function formatCount(n: number): string {
    return n.toLocaleString('en-US') + '+';
}

export async function HeroTrustStrip() {
    const t = await getTranslations('landing.hero.trust');
    const impact = await getImpact();

    const workers = impact?.workersTotal ?? null;
    const employers = impact?.verifiedEmployers ?? 0;

    if (!workers || employers === 0) return null;

    return (
        <p className="text-secondary pt-4 font-sans text-sm leading-snug">
            {t('line_dynamic', {
                workers: formatCount(workers),
                employers: formatCount(employers),
            })}
        </p>
    );
}
