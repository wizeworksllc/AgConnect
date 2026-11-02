# apps/admin

Internal operations console. English-only UI, manages EN+ES translations for the public web app. Signs in through the same better-auth server as the web app; only users with `users.role = 'admin'` get in.

## Surfaces

- **Identity** — tenants, employers, workers, users.
- **Work** — jobs, applications, enrollments, compliance.
- **Operations** — messaging, SMS, email, billing, waitlist. PII redacted by default.
- **System** — feature flags, pg-boss jobs, service health, lookup tables, AEWR.
- **Translations** — DB-backed bilingual copy editor, inline save, web revalidates via signed hook.
- **Audit / reports** — typed actions registry, placement / training / employer activity reports.

## Auth model

- One better-auth server (`services/api`, `/v1/auth/*`). The session cookie lives on `.agconn.com`, so `admin.agconn.com` receives it. Staff sign in by magic link only; the link never creates an account.
- Make an admin with `pnpm --filter @agconn/db admin:create --email you@example.com [--super]`.
- [src/proxy.ts](src/proxy.ts) only checks that the session cookie is present. [src/lib/admin-auth.ts](src/lib/admin-auth.ts) asks the api (`/admin/v1/me`) for the admin decision.
- Roles: `admin` (read + most writes) and `super_admin` (`users.permissions` contains `*`: deletes, replays, audit redaction). The gate lives server-side in [services/api/src/middleware/adminAuth.ts](../../services/api/src/middleware/adminAuth.ts).
- Dev/CI bearer fallback via `ADMIN_BEARER_TOKEN`. Never wire this in prod.

## Tenant impersonation

- URL convention: `admin.agconn.com/t/<tenantId>/<route>`. The `(shell)/t/[tenantId]/layout.tsx` calls `requireAdminScope(tenantId)` and forwards the id as `X-Admin-Tenant-Id` on every api fetch.
- Switching tenants rewrites the current sub-path; switching to "Platform" strips `/t/<id>`.
- Tenant scope is **never** a query param or client state — always the URL.

## Calling the API

- All admin pages go through [src/lib/api-server.ts](src/lib/api-server.ts) (`adminFetch`). Never reach Prisma from the admin app — the api owns the DB.
- Endpoints are mounted at `/admin/v1/*`. Routes are grouped by surface (`directory`, `work`, `ops`, `system`, `translations`, `audit`, `reports`, `kpi`, `employers`, `me`).
- `adminFetch` returns a discriminated envelope `{ ok: true, data } | { ok: false, error }`. Render the error inline; don't throw.

## PII reveal pattern

- Tables that contain phones / emails / message bodies (SMS log, email log, messaging, waitlist, user lookup) redact by default and accept `?reveal=true`.
- The reveal call is logged via `admin.data.exported` with `exportType` = `<surface>.reveal`. The reveal toggle is a `Link`, not a form — the URL is the source of truth so refresh and bookmarks stay coherent.
- Server enforces redaction; the client only renders what the server returned. Never decrypt or unmask on the client.

## House rules (admin-specific extensions)

- Server pages by default — `'use client'` only for interactive editors. Mutations go through server actions in `actions.ts` colocated with the page.
- Server actions call `revalidatePath` on success so the next render reflects the change.
- Inline editors save on **blur** (not submit). Cmd/Ctrl+Enter commits early. Server is authoritative — replace optimistic state with the response.
- Tables use `font-mono text-xs` for IDs/dates/keys, `tabular-nums` for counts and money. No emoji anywhere — `FontAwesomeIcon` only, per-icon imports from `@fortawesome/free-solid-svg-icons`.
- Filters are URL state, not React state. The admin layout assumes back-button works.
- Destructive operations gate to `org:super_admin` on the server. The UI may show the button to any admin but the api rejects the call.

## File layout

```
src/
  app/
    (auth)/sign-in/       — magic-link sign-in
    (shell)/              — main signed-in shell (Sidebar + Topbar)
      <surface>/page.tsx  — list page
      <surface>/[id]/page.tsx — detail page
      <surface>/actions.ts — server actions for mutations
      t/[tenantId]/       — tenant-scoped wrapper, re-mounts the shell
  components/admin-shell/ — Sidebar, Topbar, TenantSwitcher, nav-items
  lib/                    — adminFetch + typed wrappers per surface
  proxy.ts                — session-cookie gate
```

## When adding a new surface

1. Add the api routes under `services/api/src/admin/<surface>/routes.ts`. Mount at `/admin/v1/<surface>` in the api index.
2. Add typed wrappers in `apps/admin/src/lib/<surface>-api.ts`.
3. Create `apps/admin/src/app/(shell)/<surface>/page.tsx`. Use existing pages as templates — they share filter / table / reveal patterns.
4. Add to `apps/admin/src/components/admin-shell/nav-items.ts`. Scope is `platform`, `tenant`, or `both`.
5. If the surface mutates state, register audit actions in [packages/audit/src/registry.ts](../../packages/audit/src/registry.ts) and rebuild the package.
