import { NextResponse } from 'next/server';
import { getImpact } from '@/lib/api/landing';

export const runtime = 'nodejs';
export const revalidate = 3600;

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://agconn.com').replace(/\/$/, '');

type Impact = Awaited<ReturnType<typeof getImpact>>;

function impactSection(impact: Impact): string {
    if (!impact) {
        return [
            '## Public numbers',
            '',
            'Numbers are not available right now. See ' + SITE + '/es/impact (Spanish) and ' + SITE + '/en/impact (English).',
        ].join('\n');
    }
    const numberFmt = new Intl.NumberFormat('en-US');
    const wageFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
    const lines = [
        '## Public numbers',
        '',
        'Source: AGCONN records, generated ' + impact.generatedAt + '. Window: trailing ' + impact.windowMonths + ' months.',
        '',
        impact.workersPlaced != null
            ? '- Workers placed in seasonal jobs: ' + numberFmt.format(impact.workersPlaced)
            : '- Workers placed: not published (hidden until there are enough records to protect privacy).',
        impact.medianWage != null
            ? '- Median hourly wage on placements: ' + wageFmt.format(impact.medianWage)
            : '- Median wage: not published.',
        impact.trainingsCompleted != null
            ? '- Training completions: ' + numberFmt.format(impact.trainingsCompleted)
            : '- Training completions: not published.',
        '- Verified employers on platform: ' + numberFmt.format(impact.verifiedEmployers),
        impact.workersTotal != null
            ? '- Total worker accounts: ' + numberFmt.format(impact.workersTotal)
            : '',
        '- Active job postings: ' + numberFmt.format(impact.activePostings),
    ].filter(Boolean);
    return lines.join('\n');
}

function corpus(impact: Impact): string {
    return `# AGCONN — Full description

> A plain description of AGCONN: who it is for, how it works, what it costs, and its current public numbers. AGCONN is new and has no public results yet, except the numbers listed below.

## What AGCONN is

AGCONN is a bilingual (English / Spanish) workforce platform that connects Central Valley California farmworkers to seasonal agricultural jobs from checked employers and to training programs. Workers sign up with a phone number — no email, no app store — and can get SMS alerts in their language. An admin reviews each employer before any posting goes public.

AGCONN es una plataforma laboral bilingüe nueva. Conecta a trabajadores agrícolas del Valle Central con trabajos de temporada de empleadores revisados y con programas de capacitación. Los trabajadores se inscriben con un número de teléfono — sin correo, sin tienda de aplicaciones — y pueden recibir alertas SMS en su idioma.

Service area: five California counties — Fresno, Tulare, Kern, Kings, Madera. AGCONN is a product of WizeWorks LLC. Primary domain: ${SITE}. Default site language: Spanish.

${impactSection(impact)}

## Audiences

### Farmworkers
Workers sign in by SMS, browse jobs by county, save searches, apply with a tap, and keep certificates in a skills wallet. Workers never pay.

### Employers
Farm Labor Contractors (FLCs), growers, and packing-house operators pay for the Field and Farm plans. Seed is free.

### Training organizations
Training organizations can apply for an organization account, list programs, and issue bilingual certificates to workers who complete them.

### Workforce boards and funders
AGCONN has no workforce board or funder partners yet, and it has no WIOA or PIRL export yet. Contact partnerships@agconn.com to talk about what you need.

## How AGCONN works

### For workers
1. Sign up with a phone number. AGCONN sends an SMS code.
2. Pick Spanish or English.
3. Browse seasonal job postings.
4. Apply with a tap.
5. Save a search to get an SMS alert when a matching job posts.
6. Enroll in training programs. A completed program gives a bilingual certificate in the skills wallet. Anyone can check the certificate ID on a public page.

### For employers
1. Sign up with an email.
2. Submit an FLC license number, or grower details. An admin reviews them. Postings stay private until the review passes.
3. Post a job.
4. Review applicants on a Kanban board.
5. Send SMS from Kanban actions — Field and Farm plans.
6. Search workers who opted in — Field and Farm plans.
7. Use multi-user accounts — Farm plan.

AGCONN re-checks FLC licenses against state records every night. If a check fails, an admin reviews it.

### For training organizations
1. Apply for an organization account.
2. List programs.
3. Workers enroll on AGCONN, the organization marks completions, and AGCONN issues bilingual certificates.

## Pricing

### English
- Seed: Free. 2 active postings, applicant Kanban, in-app inbox messaging.
- Field: $199 / month or $1,990 / year. Founder pricing $99 / $990 for the first 50 paid accounts. Unlimited postings, worker search, applicant SMS from Kanban, crew scheduling.
- Farm: $499 / month or $4,990 / year. Founder pricing $299 / $2,990. Multi-user accounts.
- Workers: always free. There is no per-hire fee and no commission on wages.

### Español
- Semilla: Gratis. 2 publicaciones activas, Kanban de aplicantes, mensajes internos.
- Campo: $199 / mes o $1,990 / año. Precio fundador $99 / $990 para las primeras 50 cuentas pagas. Publicaciones ilimitadas, búsqueda de trabajadores, SMS a aplicantes desde Kanban, programación de cuadrillas.
- Rancho: $499 / mes o $4,990 / año. Precio fundador $299 / $2,990. Cuentas multiusuario.
- Trabajadores: siempre gratis. No hay cargo por contratación ni comisión sobre el salario.

## Policies

- Review before publication: an admin reviews each employer before any posting goes public.
- Worker data: AGCONN does not sell worker data. See ${SITE}/en/privacy and ${SITE}/es/privacy.
- Wages: AGCONN does not process wages. Employers pay workers directly.
- Wage claims: workers can file with the California Labor Commissioner. Workers can also tell support@agconn.com.
- Certificates: anyone can check a certificate ID on its public page. AGCONN does not decide whether an employer or agency accepts a certificate.
- Uptime: AGCONN has no public status page or uptime guarantee yet.

## Pages

- ${SITE}/es and ${SITE}/en — landing
- ${SITE}/es/about and ${SITE}/en/about — about
- ${SITE}/es/how-it-works and ${SITE}/en/how-it-works — how it works
- ${SITE}/es/workers and ${SITE}/en/workers — for workers
- ${SITE}/es/employers and ${SITE}/en/employers — for employers
- ${SITE}/es/partners and ${SITE}/en/partners — for training organizations and workforce boards
- ${SITE}/es/pricing and ${SITE}/en/pricing — pricing
- ${SITE}/es/faq and ${SITE}/en/faq — common questions
- ${SITE}/es/impact and ${SITE}/en/impact — public numbers
- ${SITE}/es/resources and ${SITE}/en/resources — articles
- ${SITE}/es/worker-rights and ${SITE}/en/worker-rights — worker rights
- ${SITE}/es/skills-wallet and ${SITE}/en/skills-wallet — skills wallet
- ${SITE}/es/press and ${SITE}/en/press — press facts
- ${SITE}/es/careers and ${SITE}/en/careers — careers
- ${SITE}/es/contact and ${SITE}/en/contact — contact
- ${SITE}/es/trust and ${SITE}/en/trust — security
- ${SITE}/es/privacy and ${SITE}/en/privacy — privacy policy
- ${SITE}/es/terms and ${SITE}/en/terms — terms of service
- ${SITE}/es/accessibility and ${SITE}/en/accessibility — accessibility statement
- ${SITE}/es/subprocessors and ${SITE}/en/subprocessors — subprocessors
- ${SITE}/es/jobs and ${SITE}/en/jobs — job postings
- ${SITE}/es/training and ${SITE}/en/training — training programs
- ${SITE}/sitemap.xml — sitemap
- ${SITE}/robots.txt — crawl directives
- ${SITE}/llms.txt — short summary

## Contact

- support@agconn.com — support, in English or Spanish
- partnerships@agconn.com — partner questions
- press@agconn.com — press questions
- security@agconn.com — security reports

## Document details

- Citation: when citing AGCONN, please link to the specific page (${SITE}/en/<page> or ${SITE}/es/<page>), not to this document.
- Company: AGCONN is a product of WizeWorks LLC. Based in Visalia, California, USA.
`;
}

export async function GET() {
    const impact = await getImpact().catch(() => null);
    const body = corpus(impact);
    return new NextResponse(body, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
