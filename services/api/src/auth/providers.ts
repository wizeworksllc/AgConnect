import type { BetterAuthOptions } from 'better-auth';

type Env = Record<string, string | undefined>;

// A provider is on only when both of its keys are set; the web app asks /v1/auth/providers which ones are.
export function socialProviders(env: Env = process.env): NonNullable<BetterAuthOptions['socialProviders']> {
  const out: NonNullable<BetterAuthOptions['socialProviders']> = {};
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    out.google = { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET };
  }
  if (env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET) {
    out.microsoft = {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      tenantId: env.MICROSOFT_TENANT_ID ?? 'common',
    };
  }
  if (env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET) {
    out.apple = {
      clientId: env.APPLE_CLIENT_ID,
      clientSecret: env.APPLE_CLIENT_SECRET,
      appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER,
    };
  }
  return out;
}

export const enabledProviders = (env: Env = process.env) => Object.keys(socialProviders(env));
