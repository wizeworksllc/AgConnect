export type AuthEmailKind = 'code' | 'magic_link' | 'reset_password';

type Copy = { subject: string; lead: string; action?: string; footer: string };

export const authEmailStrings: Record<AuthEmailKind, Record<'en' | 'es', Copy>> = {
  code: {
    en: {
      subject: 'Your AGCONN code',
      lead: 'Enter this code to continue. It expires in 5 minutes.',
      footer: 'If you did not ask for this code, you can ignore this email.',
    },
    es: {
      subject: 'Tu código de AGCONN',
      lead: 'Escribe este código para continuar. Vence en 5 minutos.',
      footer: 'Si no pediste este código, puedes ignorar este correo.',
    },
  },
  magic_link: {
    en: {
      subject: 'Sign in to AGCONN',
      lead: 'Use this link to sign in. It works once and expires in 5 minutes.',
      action: 'Sign in',
      footer: 'If you did not ask to sign in, you can ignore this email.',
    },
    es: {
      subject: 'Entra a AGCONN',
      lead: 'Usa este enlace para entrar. Funciona una vez y vence en 5 minutos.',
      action: 'Entrar',
      footer: 'Si no pediste entrar, puedes ignorar este correo.',
    },
  },
  reset_password: {
    en: {
      subject: 'Reset your AGCONN password',
      lead: 'Use this link to choose a new password. It expires in 1 hour.',
      action: 'Choose a new password',
      footer: 'If you did not ask for this, your password stays the same.',
    },
    es: {
      subject: 'Cambia tu contraseña de AGCONN',
      lead: 'Usa este enlace para elegir una contraseña nueva. Vence en 1 hora.',
      action: 'Elegir contraseña nueva',
      footer: 'Si no lo pediste, tu contraseña no cambia.',
    },
  },
};
