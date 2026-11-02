import { sendAuthEmail } from '@agconn/email';
import { sendAuthCodeSms } from '@agconn/sms';
import { authContext } from './request-context.js';

export const sendPhoneCode = async ({ phoneNumber, code }: { phoneNumber: string; code: string }) => {
  await sendAuthCodeSms(phoneNumber, code, authContext().locale);
};

export const sendEmailCode = async ({ email, otp }: { email: string; otp: string }) => {
  await sendAuthEmail({ kind: 'code', to: email, locale: authContext().locale, code: otp });
};

export const sendMagicLink = async ({ email, url }: { email: string; url: string }) => {
  await sendAuthEmail({ kind: 'magic_link', to: email, locale: authContext().locale, url });
};

export const sendResetPassword = async ({ user, url }: { user: { email: string }; url: string }) => {
  await sendAuthEmail({ kind: 'reset_password', to: user.email, locale: authContext().locale, url });
};
