# Clerk to better-auth migration

Status: in progress on branch `feat/better-auth` (2026-11-01).

## Why

- The Clerk setup does not work today, and AgConnect has no real users yet. Nothing has to be carried over.
- Every other live WizeWorks product (sparx, piggles, kanninja, rocketease, WizeLens, wizeworks admin) runs better-auth. One auth stack across the portfolio.
- Identity moves into our own Postgres. Clerk drops off the sub-processor list.

## Decisions

1. **One better-auth server, inside `services/api`**, mounted at `/v1/auth/*` on `api.agconn.com`. Web and admin both use it.
2. **Session cookie on `.agconn.com`** (`crossSubDomainCookies`), so `agconn.com`, `admin.agconn.com` and `api.agconn.com` all see it. Locally every port on `localhost` shares the cookie. The API reads the cookie (browser calls already send `credentials: 'include'`); server components forward it.
3. **Auth tables live in our Postgres** through the Prisma adapter: `auth_users`, `auth_sessions`, `auth_accounts`, `auth_verifications`, `auth_two_factors`. They get RLS that allows only `app.role = 'auth'`; the auth server's own Prisma client sets that role at connect time. App pools never read them.
4. **`users.id` = the better-auth user id.** Same shape as before (`users.id` was the Clerk id). No foreign key changes. The app `users` row is still the source of truth for role, permissions, tenant and consent.
5. **The Clerk webhook goes away.** better-auth `databaseHooks.user.create.after` upserts the `users` row and writes `web_otp` consent, in the same process. `auth_events` still gets a row per sign-up and sign-in.
6. **Admin is the same server, gated by `users.role = 'admin'`.** Admins sign in by magic link only (`disableSignUp`, so a link only works for an existing account). `users.permissions` containing `*` replaces `org:super_admin`. Admin accounts are made by `scripts/create-admin.ts`, never by self sign-up. The two-instance split is gone.
7. **Role at sign-up** comes from a `signupRole` additional field that only accepts `worker | employer | training_org`. Admin can never be self-declared (same rule as the old `unsafeMetadata`).
8. **SMS-provisioned workers** are created straight in `auth_users` (phone, verified, temp email) by `@agconn/auth`. When that worker later signs in on the web with a text code, the phone-number plugin finds the same account.
9. **We send our own codes.** Text codes go through the existing Twilio sender (`@agconn/sms`); emails go through `@agconn/email`. Both bilingual.

## Feature map

| Clerk feature in use | better-auth replacement |
| --- | --- |
| Phone text code sign-in and sign-up (workers) | `phoneNumber` plugin, `signUpOnVerification` |
| Email code sign-up, email verification | `emailOTP` plugin |
| Password (employers) | built-in `emailAndPassword` |
| Google sign-in; Microsoft and Apple linking | `socialProviders`, each one on only when its env keys exist |
| TOTP and backup codes | `twoFactor` plugin |
| Active sessions list and revoke | built-in `listSessions` / `revokeSession` |
| Profile photo | `updateUser({ image })` with the existing upload path |
| Delete account | built-in `deleteUser` + hook that soft-nulls `users.tenant_id` |
| Admin magic link | `magicLink` plugin, `disableSignUp: true` |
| Clerk bot protection | built-in rate limits on auth routes |
| `@clerk/localizations` | our own `en.json` / `es.json` strings (forms are already ours) |
| `sso-callback` page | not needed; better-auth redirects to `callbackURL` |

## Steps

Each step ends with typecheck and tests passing (run through the agent queue).

1. **Schema.** Add the five auth models to `schema.prisma` and one migration with the tables, indexes and the `app.role = 'auth'` RLS policies. Add `authDb` to `@agconn/db`. Update `check-tenant-id.mjs` (identity category). Drop `employer_profiles.clerk_org_id`.
2. **Auth server.** `services/api/src/auth/` holds the better-auth config split by concern (server, senders, hooks, providers). Mount the handler at `/v1/auth/*` before the audit middleware. Add `X-Employer-Id` and `X-Admin-Tenant-Id` to CORS allow-headers.
3. **API middleware.** Replace `clerkAuthMiddleware` with `sessionMiddleware` (one `auth.api.getSession` per request). `requireAuth` keeps its contract; only the identity lookup changes. Merge `requireAdminOrg` and the old `adminMiddleware` into one gate on `users.role = 'admin'`, keeping the `ADMIN_BEARER_TOKEN` dev path. Delete `webhooks/clerk.ts` and `provisionFromClerk`.
4. **`@agconn/auth`.** Replace `clerk-provision.ts` with `provision-by-phone.ts` (`ensureAuthUserByPhone`, `updateAuthUserName`). Update the SMS worker and the Twilio onboarding webhook.
5. **Web app.** Add `lib/auth-client.ts`. Rewrite `proxy.ts` to check the session cookie. Remove `ClerkProvider`, `ClerkTokenBridge`, `ClerkReadyGate`, the token store and the `window.Clerk` fallback. Server client forwards the cookie. Rewrite sign-in, worker sign-up and employer sign-up forms on the auth client. Rewrite the account sections (emails, phones, password, connected accounts, two-step, devices, photo, delete). Swap `useUser` callers to a `useSession` wrapper.
6. **Admin app.** Magic-link sign-in page, `requireAdmin()` reads the session and the `users` row through the API (`/admin/v1/me`), topbar user menu without `UserButton`, forbidden page sign-out. Remove Clerk from `proxy.ts`.
7. **Config and deploy.** New env: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `AUTH_COOKIE_DOMAIN`, optional `GOOGLE_*`, `MICROSOFT_*`, `APPLE_*`. Remove every `CLERK_*` key from `.env.example`, k8s config, Dockerfiles, `deploy.yml`, `load-keyvault.mjs`, `actionsecrets.md`. Add `BETTER_AUTH_SECRET` to Key Vault `agconn`.
8. **Docs and copy.** Update this folder, the CLAUDE.md files, the multi-tenancy and identity docs, the sub-processor page and the marketing sub-processor list.
9. **Remove Clerk.** Uninstall every `@clerk/*` package (keep `svix`: the Resend webhook still uses it). `grep -ri clerk` outside history docs returns nothing.
10. **Verify.** Unit tests for the hooks and gates; run the API and web app locally and sign up as a worker (phone), an employer (email and password), and an admin (magic link).

## Out of scope

- Jotacular (stays on Auth.js for now).
- Passkeys, SSO/SAML, organizations plugin.
- Moving to a shared WizeWorks identity server.

## Needs Brandon

- Google OAuth client for `api.agconn.com/v1/auth/callback/google` (and Microsoft / Apple if wanted). Without keys those buttons stay hidden.
- Running the release after the PR merges. Key Vault needs `BETTER_AUTH_SECRET` first.
