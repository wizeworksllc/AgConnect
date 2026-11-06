import type { ResourceArticle } from '../types';

export const forkliftCertification: ResourceArticle = {
    slug: 'forklift-certification',
    category: 'training_explainers',
    publishedAt: '2026-04-20',
    readingMinutes: 5,
    title: {
        en: 'Forklift certification for warehouse and packing-shed work: what it is and why it pays',
        es: 'Certificación de montacargas para trabajo en almacenes y empacadoras: qué es y por qué paga',
    },
    summary: {
        en: 'OSHA-compliant forklift training can open packing-shed and cold-storage roles. Here is what the course covers and where to take it.',
        es: 'La capacitación de montacargas que cumple con OSHA puede abrir puestos en empacadoras y almacenamiento en frío. Esto es lo que cubre el curso y dónde tomarlo.',
    },
    sections: [
        {
            heading: {
                en: 'What the regulation requires',
                es: 'Lo que requiere la regulación',
            },
            body: {
                en: 'OSHA 1910.178 requires every forklift operator in the United States to be trained, evaluated, and certified by their employer before they operate the equipment. Training has three parts: formal instruction (lecture, video, written material), practical training (demonstration and hands-on exercises), and an evaluation in the actual workplace. Re-evaluation is required every three years, after an accident, or when conditions change.',
                es: 'OSHA 1910.178 requiere que todo operador de montacargas en los Estados Unidos sea capacitado, evaluado y certificado por su empleador antes de operar el equipo. La capacitación tiene tres partes: instrucción formal (conferencia, video, material escrito), capacitación práctica (demostración y ejercicios prácticos) y una evaluación en el lugar de trabajo real. Se requiere reevaluación cada tres años, después de un accidente o cuando cambian las condiciones.',
            },
        },
        {
            heading: {
                en: 'Bilingual training is recognized',
                es: 'La capacitación bilingüe está reconocida',
            },
            body: {
                en: 'OSHA explicitly accepts training delivered in Spanish. The certification card and the workplace evaluation are recognized just as in English. Ask the training provider whether the instruction and the practical evaluation are in Spanish.',
                es: 'OSHA acepta explícitamente la capacitación impartida en español. La tarjeta de certificación y la evaluación en el lugar de trabajo se reconocen igual que en inglés. Pregunte al proveedor de capacitación si la instrucción y la evaluación práctica son en español.',
            },
        },
        {
            heading: {
                en: 'What the course covers',
                es: 'Qué cubre el curso',
            },
            body: {
                en: 'Course content includes: forklift types and stability principles, pre-shift inspection, safe operation rules including pedestrian protection, load handling and stacking, fueling and battery handling for electric units, and reporting damage or near-misses. Most courses run 8–12 hours total, split across one or two days.',
                es: 'El contenido del curso incluye: tipos de montacargas y principios de estabilidad, inspección previa al turno, reglas de operación segura incluyendo protección de peatones, manejo y apilamiento de cargas, abastecimiento de combustible y manejo de baterías para unidades eléctricas, y reportar daños o casi accidentes. La mayoría de los cursos duran 8–12 horas en total, divididos en uno o dos días.',
            },
        },
        {
            heading: {
                en: 'Why it pays',
                es: 'Por qué paga',
            },
            body: {
                en: 'In Central Valley packing sheds and cold-storage facilities, a forklift certification can open roles beyond the packing line. The certification can also extend your work calendar — packing operations run year-round in many crops, while picking work is often seasonal.',
                es: 'En las empacadoras y instalaciones de almacenamiento en frío del Valle Central, una certificación de montacargas puede abrir puestos más allá de la línea de empaque. La certificación también puede extender su calendario de trabajo — las operaciones de empaque funcionan todo el año en muchos cultivos, mientras que el trabajo de cosecha suele ser estacional.',
            },
        },
    ],
};
