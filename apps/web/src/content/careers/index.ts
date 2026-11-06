import type { CareerRole, CareerTeam } from '../types';

const ALL: CareerRole[] = [];

export function getAllCareerRoles(): CareerRole[] {
    return [...ALL].sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));
}

export function getCareerRoleBySlug(slug: string): CareerRole | null {
    return ALL.find((r) => r.slug === slug) ?? null;
}

export function getAllCareerSlugs(): string[] {
    return ALL.map((r) => r.slug);
}

export function getCareerTeams(): CareerTeam[] {
    const seen = new Set<CareerTeam>();
    for (const r of ALL) seen.add(r.team);
    const order: CareerTeam[] = ['engineering', 'design', 'data', 'partnerships', 'operations'];
    return order.filter((t) => seen.has(t));
}
