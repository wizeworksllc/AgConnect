# packages/

Shared internal libraries consumed by `apps/` and `services/`. Each package is `"private": true` — nothing is published to npm.

## Suggested packages

Materialize as needed — don't pre-create empty packages.

- `db/` — Prisma client, schema, migrations, RLS policy template, seed data, transaction helpers. The single source of database truth.
- `auth/` — identity helpers shared by the api and workers: phone-first auth user provisioning (`ensureAuthUserByPhone`), declared-role and temp-email rules, role checks.
- `i18n/` — next-intl config, locale routing, EN/ES message merging, `brand.product_name` resolution.
- `ui/` — Tierra-themed primitives. Wordmark, FaIcon wrapper, theme-aware Button/Input/Modal where daisyUI defaults need overriding. Brand-critical layout sections live in their consuming app, not here.
- `schemas/` — Zod schemas shared between API and frontend. Request/response shapes, `ResumeSchema`, form validators, enum sources.
- `messaging/` — SMS template registry, React Email template registry, locale-aware rendering, quiet-hours helper, idempotency-key formatter.
- `tsconfig/` — base tsconfig presets (`base.json`, `nextjs.json`, `node.json`).

## Conventions

- Each package: own `package.json` with explicit `exports` field, own `tsconfig.json` extending `@agconn/tsconfig`.
- Dependency direction: `apps/` and `services/` → `packages/`. Never the reverse. Apps don't import each other; if logic is shared by two apps, hoist it into a package.
- Cross-package graph stays shallow. `db` and `schemas` are leaves. `auth`, `messaging`, `ui` may depend on those.
- Tests colocated under `__tests__/` next to source.
- Public exports must be intentional. Don't barrel-export internals.
