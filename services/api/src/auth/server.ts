import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP, magicLink, phoneNumber, twoFactor } from 'better-auth/plugins';
import { tempEmailForPhone } from '@agconn/auth';
import { authDb } from '@agconn/db';
import { allowedOrigins } from '../lib/security.js';
import { afterDeleteUser, databaseHooks } from './hooks.js';
import { socialProviders } from './providers.js';
import { sendEmailCode, sendMagicLink, sendPhoneCode, sendResetPassword } from './senders.js';

export const AUTH_BASE_PATH = '/v1/auth';
export const AUTH_COOKIE_PREFIX = 'agconn';

const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;
const FIVE_MINUTES = 5 * 60;

export const auth = betterAuth({
  appName: 'AGCONN',
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.PUBLIC_API_URL ?? 'http://localhost:3001',
  basePath: AUTH_BASE_PATH,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(authDb, { provider: 'postgresql' }),
  trustedOrigins: [...allowedOrigins()],
  user: {
    modelName: 'authUser',
    additionalFields: {
      signupRole: { type: 'string', required: false, input: true },
      locale: { type: 'string', required: false, input: true },
    },
    changeEmail: { enabled: true },
    deleteUser: { enabled: true, afterDelete: afterDeleteUser },
  },
  session: {
    modelName: 'authSession',
    cookieCache: { enabled: true, maxAge: FIVE_MINUTES },
  },
  account: {
    modelName: 'authAccount',
    accountLinking: { enabled: true, trustedProviders: ['google', 'microsoft', 'apple'] },
  },
  verification: { modelName: 'authVerification' },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    sendResetPassword,
  },
  socialProviders: socialProviders(),
  databaseHooks,
  advanced: {
    cookiePrefix: AUTH_COOKIE_PREFIX,
    crossSubDomainCookies: cookieDomain ? { enabled: true, domain: cookieDomain } : undefined,
  },
  plugins: [
    phoneNumber({
      otpLength: 6,
      expiresIn: FIVE_MINUTES,
      sendOTP: sendPhoneCode,
      signUpOnVerification: {
        getTempEmail: tempEmailForPhone,
        getTempName: (phone) => phone,
      },
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: FIVE_MINUTES,
      overrideDefaultEmailVerification: true,
      // Email change is code-based too: emailOtp.requestEmailChange, then emailOtp.changeEmail.
      changeEmail: { enabled: true },
      sendVerificationOTP: sendEmailCode,
    }),
    twoFactor({
      issuer: 'AGCONN',
      schema: { twoFactor: { modelName: 'authTwoFactor' } },
    }),
    magicLink({
      expiresIn: FIVE_MINUTES,
      disableSignUp: true,
      sendMagicLink,
    }),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
