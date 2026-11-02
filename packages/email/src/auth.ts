import { Resend } from 'resend';
import { authEmailStrings, type AuthEmailKind } from './strings/auth.js';

export type AuthEmail =
  | { kind: 'code'; to: string; locale: 'en' | 'es'; code: string }
  | { kind: 'magic_link' | 'reset_password'; to: string; locale: 'en' | 'es'; url: string };

const escape = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function render(email: AuthEmail): { subject: string; html: string; text: string } {
  const copy = authEmailStrings[email.kind as AuthEmailKind][email.locale];
  const body =
    email.kind === 'code'
      ? `<p style="font-size:28px;letter-spacing:6px;font-weight:600">${escape(email.code)}</p>`
      : `<p><a href="${escape(email.url)}" style="background:#5B6E2E;color:#fff;padding:12px 20px;border-radius:9999px;text-decoration:none">${escape(copy.action ?? '')}</a></p>`;
  const detail = email.kind === 'code' ? email.code : email.url;
  return {
    subject: copy.subject,
    html: `<div style="font-family:Inter,Arial,sans-serif;color:#2a2a22"><p>${escape(copy.lead)}</p>${body}<p style="color:#6b6b5e;font-size:13px">${escape(copy.footer)}</p></div>`,
    text: `${copy.lead}\n\n${detail}\n\n${copy.footer}`,
  };
}

let resend: Resend | null = null;

// Codes and sign-in links go straight to Resend: no queue delay, and no email_log row holding a secret.
// Without a key outside production the message is logged so local sign-in still works.
export async function sendAuthEmail(email: AuthEmail): Promise<void> {
  const { subject, html, text } = render(email);
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') throw new Error('RESEND_API_KEY is not set');
    console.info(`[auth] email to ${email.to}: ${text}`);
    return;
  }
  resend ??= new Resend(key);
  const from = process.env.RESEND_FROM_EMAIL ?? 'AGCONN <hello@agconn.com>';
  const result = await resend.emails.send({ from, to: email.to, subject, html, text, tags: [{ name: 'template', value: `auth_${email.kind}` }] });
  if (result.error) throw new Error(`Resend send failed: ${result.error.message}`);
}
