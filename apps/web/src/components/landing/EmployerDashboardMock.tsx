import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { Wordmark } from '@/components/primitives/Wordmark';

const columns = [
    { id: 'applied', cards: ['a', 'b', 'c'], variant: 'light' },
    { id: 'reviewed', cards: ['d', 'e'], variant: 'light' },
    { id: 'hired', cards: ['f', 'g'], variant: 'dark' },
] as const;

export function EmployerDashboardMock() {
    const t = useTranslations('landing.employer_showcase.mock');

    return (
        <div className="bg-base-100 w-full shadow-2xl">
            <div className="border-base-300 flex items-center justify-between border-b px-5 py-3.5">
                <div className="flex items-center gap-3">
                    <Wordmark size="sm" tone="ink" />
                    <span className="border-base-300 border-l py-0.5 pl-2.5">
                        <span className="text-secondary font-sans text-sm">{t('account')}</span>
                    </span>
                </div>
                <div className="badge badge-primary gap-2">
                    <FontAwesomeIcon icon={faStar} className="text-accent text-[10px]" />
                    <span className="font-semibold">{t('verified')}</span>
                </div>
            </div>

            <div className="p-4 md:p-6">
                <div className="pb-4">
                    <p className="text-base-content font-serif text-xl font-semibold tracking-tight md:text-2xl">
                        {t('heading')}
                    </p>
                    <p className="text-secondary mt-1 font-sans text-sm">{t('note')}</p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {columns.map((col) => (
                        <KanbanColumn
                            key={col.id}
                            title={t(`column.${col.id}`)}
                            cards={col.cards.map((c) => ({
                                name: t(`card.${c}.name`),
                                meta: t(`card.${c}.meta`),
                            }))}
                            variant={col.variant}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

type Card = { name: string; meta: string };

function KanbanColumn({
    title,
    cards,
    variant,
}: {
    title: string;
    cards: Card[];
    variant: 'light' | 'dark';
}) {
    const isDark = variant === 'dark';
    const colBg = isDark ? 'bg-primary' : 'bg-base-300';
    const titleClass = isDark ? 'text-primary-content' : 'text-base-content';
    const dividerClass = isDark ? 'border-secondary' : 'border-base-300';
    const cardBg = isDark ? 'bg-neutral' : 'bg-base-100 border-base-300 border';
    const cardName = isDark ? 'text-neutral-content' : 'text-base-content';
    const cardMeta = isDark ? 'text-neutral-content' : 'text-secondary';

    return (
        <div className={`flex flex-col gap-2 p-3 ${colBg}`}>
            <p className={`border-b pb-1.5 font-sans text-sm font-semibold ${dividerClass} ${titleClass}`}>
                {title}
            </p>
            {cards.map((c) => (
                <div key={c.name} className={`p-2.5 ${cardBg}`}>
                    <p className={`font-serif text-sm font-semibold ${cardName}`}>{c.name}</p>
                    <p className={`font-sans text-sm ${cardMeta}`}>{c.meta}</p>
                </div>
            ))}
        </div>
    );
}
