type Props = {
    meta?: React.ReactNode;
    title: React.ReactNode;
    sub?: React.ReactNode;
    right?: React.ReactNode;
};

export function WorkerPageHeader({ meta, title, sub, right }: Props) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
                <h1 className="font-serif mt-2 text-[32px] font-normal leading-[1.05] tracking-[-0.025em] sm:text-[44px]">
                    {title}
                </h1>
                {meta && <p className="mt-1 font-sans text-sm">{meta}</p>}
                {sub && (
                    <p className="text-base-content/70 mt-1.5 max-w-[640px] text-[14.5px]">
                        {sub}
                    </p>
                )}
            </div>
            {right && <div className="flex shrink-0 gap-2">{right}</div>}
        </div>
    );
}
