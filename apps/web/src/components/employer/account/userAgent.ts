const BROWSERS: [RegExp, string][] = [
    [/Edg\//, 'Edge'],
    [/SamsungBrowser\//, 'Samsung Internet'],
    [/OPR\//, 'Opera'],
    [/Firefox\/|FxiOS\//, 'Firefox'],
    [/Chrome\/|CriOS\//, 'Chrome'],
    [/Safari\//, 'Safari'],
];

const SYSTEMS: [RegExp, string][] = [
    [/Android/, 'Android'],
    [/iPhone|iPad|iPod/, 'iOS'],
    [/Windows/, 'Windows'],
    [/Mac OS X|Macintosh/, 'macOS'],
    [/CrOS/, 'ChromeOS'],
    [/Linux/, 'Linux'],
];

const match = (ua: string, table: [RegExp, string][]) => table.find(([rx]) => rx.test(ua))?.[1];

export function describeUserAgent(ua: string | null | undefined): { label: string | null; isMobile: boolean } {
    if (!ua) return { label: null, isMobile: false };
    const parts = [match(ua, BROWSERS), match(ua, SYSTEMS)].filter(Boolean);
    return {
        label: parts.length > 0 ? parts.join(' · ') : null,
        isMobile: /Mobi|Android|iPhone|iPad|iPod/.test(ua),
    };
}
