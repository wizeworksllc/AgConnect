import { ImageResponse } from 'next/og';
import { OgFrame } from '../../_shared/OgFrame';
import { loadFonts } from '../../_shared/fonts';
import { palette } from '../../_shared/palette';
import { getImpact } from '@/lib/api/landing';

export const runtime = 'nodejs';
export const revalidate = 86400;

type Locale = 'en' | 'es';

type PageCopy = {
    headline: { en: string; es: string };
    italicLead?: { en: string; es: string };
    subhead: { en: string; es: string };
    accentDot?: 'primary' | 'accent';
    stat?: { en: string; es: string };
};

const PAGES: Record<string, PageCopy> = {
    faq: {
        headline: {
            en: 'How AGCONN works, in plain terms.',
            es: 'Cómo funciona AGCONN, en palabras claras.',
        },
        subhead: {
            en: 'Verification, pricing, certificates, data — answered for workers, employers, and partners.',
            es: 'Verificación, precios, certificados, datos — respuestas para trabajadores, empleadores y socios.',
        },
        stat: {
            en: 'Workers · Employers · Training organizations · Funders',
            es: 'Trabajadores · Empleadores · Organizaciones · Patrocinadores',
        },
        accentDot: 'primary',
    },
    impact: {
        headline: {
            en: 'Numbers from our own records.',
            es: 'Números de nuestros propios registros.',
        },
        subhead: {
            en: 'Placements, wages, training completions, verified employers.',
            es: 'Colocaciones, salarios, capacitaciones, empleadores verificados.',
        },
        accentDot: 'accent',
    },
    pricing: {
        headline: {
            en: 'Workers free. Employers pay.',
            es: 'Trabajadores gratis. Empleadores pagan.',
        },
        subhead: {
            en: 'Seed free · Field $199/mo · Farm $499/mo. No per-hire fee, no commission on wages.',
            es: 'Seed gratis · Field $199/mes · Farm $499/mes. Sin cargo por contratación, sin comisión sobre el salario.',
        },
        stat: {
            en: 'Founder pricing — first 50 paid accounts',
            es: 'Precio fundador — primeras 50 cuentas pagas',
        },
        accentDot: 'primary',
    },
    about: {
        headline: {
            en: 'Bilingual workforce tools for the Central Valley.',
            es: 'Herramientas laborales bilingües para el Valle Central.',
        },
        subhead: {
            en: 'Checked employers, bilingual certificates, portable records. A product of WizeWorks LLC.',
            es: 'Empleadores revisados, certificados bilingües, registros portátiles. Un producto de WizeWorks LLC.',
        },
        accentDot: 'primary',
    },
    workers: {
        italicLead: { en: 'Real work,', es: 'Trabajo real,' },
        headline: {
            en: 'in your language.',
            es: 'en tu idioma.',
        },
        subhead: {
            en: 'Seasonal jobs across five Central Valley counties. Sign in by SMS. No app store, no email.',
            es: 'Trabajos de temporada en cinco condados del Valle Central. Ingresa por SMS. Sin tienda, sin correo.',
        },
        accentDot: 'accent',
    },
    employers: {
        headline: {
            en: 'Post bilingual jobs in five Central Valley counties.',
            es: 'Publica trabajos bilingües en cinco condados del Valle Central.',
        },
        subhead: {
            en: 'FLC license review, bilingual postings, applicant Kanban.',
            es: 'Revisión de licencia FLC, publicaciones bilingües, Kanban de aplicantes.',
        },
        accentDot: 'primary',
    },
    partners: {
        headline: {
            en: 'For training organizations and workforce boards.',
            es: 'Para organizaciones de capacitación y juntas laborales.',
        },
        subhead: {
            en: 'List programs, issue bilingual certificates, or talk to us about what you need.',
            es: 'Publica programas, emite certificados bilingües o habla con nosotros sobre lo que necesitas.',
        },
        accentDot: 'primary',
    },
    'how-it-works': {
        headline: {
            en: 'Sign in by SMS. Apply with a tap.',
            es: 'Ingresa por SMS. Postula con un toque.',
        },
        subhead: {
            en: 'Workers, employers, and training organizations — each flow end to end, in English and Spanish.',
            es: 'Trabajadores, empleadores y organizaciones — cada flujo completo, en español e inglés.',
        },
        accentDot: 'accent',
    },
    resources: {
        headline: {
            en: 'Worker rights, FLC compliance, training.',
            es: 'Derechos laborales, cumplimiento FLC, capacitación.',
        },
        subhead: {
            en: 'Long-form articles, written for the people doing the work — and the people hiring them.',
            es: 'Artículos a fondo, para quienes hacen el trabajo — y quienes contratan.',
        },
        accentDot: 'primary',
    },
    'worker-rights': {
        headline: {
            en: 'Wages, hours, water, shade, transportation.',
            es: 'Salarios, horas, agua, sombra, transporte.',
        },
        subhead: {
            en: 'What California law guarantees — and how to report when it is not honored.',
            es: 'Lo que la ley de California garantiza — y cómo reportar cuando no se cumple.',
        },
        accentDot: 'accent',
    },
    'skills-wallet': {
        headline: {
            en: 'Your record. Bilingual. Portable. Yours.',
            es: 'Tu registro. Bilingüe. Portátil. Tuyo.',
        },
        subhead: {
            en: 'Certificates and training completions, yours to carry.',
            es: 'Certificados y capacitaciones, tuyos para llevar.',
        },
        accentDot: 'primary',
    },
    promotora: {
        headline: {
            en: 'Materials for promotoras are planned.',
            es: 'Los materiales para promotoras están planeados.',
        },
        subhead: {
            en: 'Email us and tell us what would help.',
            es: 'Escríbenos y dinos qué te ayudaría.',
        },
        accentDot: 'accent',
    },
    careers: {
        headline: {
            en: 'We have no open roles.',
            es: 'No tenemos puestos abiertos.',
        },
        subhead: {
            en: 'Subscribe to hear when roles open.',
            es: 'Suscríbete para enterarte cuando se abran puestos.',
        },
        accentDot: 'primary',
    },
    press: {
        headline: {
            en: 'Facts about AGCONN, for journalists.',
            es: 'Datos sobre AGCONN, para periodistas.',
        },
        subhead: {
            en: 'Press contact: press@agconn.com',
            es: 'Contacto de prensa: press@agconn.com',
        },
        accentDot: 'primary',
    },
    trust: {
        headline: {
            en: 'How we handle your data.',
            es: 'Cómo manejamos tus datos.',
        },
        subhead: {
            en: 'SMS sign-in. We do not sell worker data.',
            es: 'Ingreso por SMS. No vendemos datos de trabajadores.',
        },
        accentDot: 'primary',
    },
    contact: {
        headline: {
            en: 'Write to us in English or Spanish.',
            es: 'Escríbenos en español o en inglés.',
        },
        subhead: {
            en: 'support@agconn.com · partnerships@agconn.com · press@agconn.com · security@agconn.com',
            es: 'support@agconn.com · partnerships@agconn.com · press@agconn.com · security@agconn.com',
        },
        accentDot: 'accent',
    },
};

function dotColor(c: PageCopy['accentDot']) {
    return c === 'accent' ? palette.accent : palette.primary;
}

async function impactStat(locale: Locale): Promise<string | null> {
    const impact = await getImpact().catch(() => null);
    if (!impact) return null;
    const numberFmt = new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US');
    const wageFmt = new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    });
    const parts: string[] = [];
    if (impact.workersPlaced != null) {
        parts.push(
            locale === 'es'
                ? `${numberFmt.format(impact.workersPlaced)}+ colocaciones`
                : `${numberFmt.format(impact.workersPlaced)}+ placements`,
        );
    }
    if (impact.medianWage != null) {
        parts.push(
            locale === 'es'
                ? `${wageFmt.format(impact.medianWage)}/h mediana`
                : `${wageFmt.format(impact.medianWage)}/hr median`,
        );
    }
    parts.push(
        locale === 'es'
            ? `${numberFmt.format(impact.verifiedEmployers)} empleadores verificados`
            : `${numberFmt.format(impact.verifiedEmployers)} verified employers`,
    );
    return parts.join(' · ');
}

type Props = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Props) {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const locale: Locale = searchParams.get('locale') === 'es' ? 'es' : 'en';
    const copy = PAGES[id];

    if (!copy) {
        return new Response('Not found', { status: 404 });
    }

    let stat: string | null = copy.stat?.[locale] ?? null;
    if (id === 'impact') {
        stat = (await impactStat(locale)) ?? stat;
    }

    const fonts = await loadFonts([
        'interTightBold',
        'interTightSemi',
        'interTightItalic',
        'interSemi',
        'interMed',
        'dmMonoBold',
    ]);

    return new ImageResponse(
        (
            <OgFrame
                locale={locale}
                footerLeft={
                    stat ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 9999,
                                    backgroundColor: dotColor(copy.accentDot),
                                }}
                            />
                            <span
                                style={{
                                    fontFamily: 'Inter',
                                    fontSize: 20,
                                    fontWeight: 600,
                                    color: palette.primary,
                                    letterSpacing: 1,
                                    maxWidth: 720,
                                }}
                            >
                                {stat}
                            </span>
                        </div>
                    ) : undefined
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    {copy.italicLead ? (
                        <span
                            style={{
                                fontFamily: 'Inter Tight',
                                fontStyle: 'italic',
                                fontSize: 104,
                                fontWeight: 600,
                                color: palette.soil,
                                letterSpacing: -3,
                                lineHeight: 1,
                            }}
                        >
                            {copy.italicLead[locale]}
                        </span>
                    ) : null}
                    <span
                        style={{
                            fontFamily: 'Inter Tight',
                            fontSize: copy.headline[locale].length > 48 ? 78 : 96,
                            fontWeight: 700,
                            color: palette.ink,
                            letterSpacing: -4,
                            lineHeight: 1.02,
                            maxWidth: 1060,
                        }}
                    >
                        {copy.headline[locale]}
                    </span>
                    <span
                        style={{
                            fontFamily: 'Inter',
                            fontSize: 26,
                            fontWeight: 500,
                            color: palette.ink,
                            lineHeight: 1.35,
                            maxWidth: 980,
                            marginTop: 8,
                        }}
                    >
                        {copy.subhead[locale]}
                    </span>
                </div>
            </OgFrame>
        ),
        {
            width: 1200,
            height: 630,
            fonts: fonts.map((f) => ({
                name: f.name,
                data: f.data,
                weight: f.weight,
                style: f.style,
            })),
        },
    );
}
