import { renderSms } from './templates/index.js';
import { getMessagingServiceSid, getTwilioClient } from './twilio.js';

// Sign-in codes skip the sms.send queue: the phone may not belong to a user yet, and a code
// held by quiet hours or a retry backoff is useless. Without Twilio keys outside production
// the code is logged so local sign-in still works.
export async function sendAuthCodeSms(phone: string, code: string, locale: 'en' | 'es'): Promise<void> {
  const body = renderSms('auth.code', locale, { code });
  if (!process.env.TWILIO_ACCOUNT_SID && process.env.NODE_ENV !== 'production') {
    console.info(`[auth] sms code for ${phone}: ${code}`);
    return;
  }
  await getTwilioClient().messages.create({ to: phone, messagingServiceSid: getMessagingServiceSid(), body });
}
