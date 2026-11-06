import type { PressRelease } from '../types';

const ALL: PressRelease[] = [];

export function getAllPressReleases(): PressRelease[] {
    return [...ALL].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getPressReleaseBySlug(slug: string): PressRelease | null {
    return ALL.find((r) => r.slug === slug) ?? null;
}

export function getAllPressSlugs(): string[] {
    return ALL.map((r) => r.slug);
}
