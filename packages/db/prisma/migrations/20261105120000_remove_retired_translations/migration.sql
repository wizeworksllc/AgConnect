-- The translation seed only inserts and updates, so removed keys stay in the table and still reach every page's HTML.
BEGIN;

SET LOCAL app.role = 'admin';

DELETE FROM "translation_keys"
WHERE "tenant_id" IS NULL
  AND (
    ("namespace" = 'marketing' AND "key" ~ '^subprocessors\.row\.(posthog|sentry|supabase|gcp)\.')
    OR ("namespace" = 'shell' AND "key" LIKE 'consent.%')
    OR ("namespace" = 'landing' AND "key" = 'legal.cookie_preferences')
  );

COMMIT;
