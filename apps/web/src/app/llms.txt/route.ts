import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 86400;

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://agconn.com').replace(/\/$/, '');

const body = `# AGCONN

> AGCONN is a new bilingual (English / Spanish) workforce platform that connects Central Valley farmworkers to seasonal jobs from checked employers and to training programs. AGCONN es una plataforma laboral bilingue nueva que conecta a trabajadores agricolas del Valle Central con trabajos de temporada de empleadores revisados y con programas de capacitacion.

AGCONN is a product of WizeWorks LLC, based in Visalia, California. Its service area is five California counties: Fresno, Tulare, Kern, Kings, and Madera. It serves farmworkers, growers and farm labor contractors, and training organizations. AGCONN has no public results yet.

## Surfaces

- [${SITE}/es](${SITE}/es): Landing page (Spanish - default locale).
- [${SITE}/en](${SITE}/en): Landing page (English).
- [${SITE}/es/faq](${SITE}/es/faq): Common questions about how AGCONN works (Spanish).
- [${SITE}/en/faq](${SITE}/en/faq): Common questions about how AGCONN works (English).
- [${SITE}/es/jobs](${SITE}/es/jobs): Seasonal job postings.
- [${SITE}/es/training](${SITE}/es/training): Training programs.
- [${SITE}/es/impact](${SITE}/es/impact): Public numbers from our own records. A number stays hidden until there are enough records to protect privacy.

## How AGCONN works

- Workers sign up with a phone number - no email required, no app store. They can get SMS alerts in English or Spanish.
- Employers sign up with an email. An admin reviews each FLC license or grower attestation before any posting goes public. AGCONN re-checks FLC licenses against state records every night.
- Training organizations apply for an org account and list programs. When a program marks a course complete, the worker gets a bilingual certificate in a skills wallet.
- Pricing for employers: Seed (free, 2 active postings), Field ($199/mo or $1,990/yr, with founder pricing of $99/mo or $990/yr for the first 50 paid accounts), Farm ($499/mo or $4,990/yr, with founder pricing of $299/mo or $2,990/yr). Workers never pay.

## Brand and policy

- [${SITE}/llms-full.txt](${SITE}/llms-full.txt): Longer description, pricing, policies, and current public numbers.
- [${SITE}/sitemap.xml](${SITE}/sitemap.xml): Full sitemap, EN + ES variants linked via hreflang.
- [${SITE}/es/resources](${SITE}/es/resources): Articles on farmworker rights, FLC compliance, and training.

## Optional

- [mailto:support@agconn.com](mailto:support@agconn.com): Support contact, in English or Spanish.
- [mailto:partnerships@agconn.com](mailto:partnerships@agconn.com): Partner questions.
- [mailto:press@agconn.com](mailto:press@agconn.com): Press and editorial questions.
- [mailto:security@agconn.com](mailto:security@agconn.com): Security reports.
`;

export async function GET() {
    return new NextResponse(body, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
