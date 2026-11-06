-- Removes old rows that exist only in the database. They hold retired prices, a retired vendor and an invented user count, and they reach every page's HTML.
BEGIN;

SET LOCAL app.role = 'admin';

DELETE FROM "translation_keys"
WHERE "tenant_id" IS NULL
  AND (
    ("namespace" = 'auth' AND "key" IN (
      'shared.powered_by'
    ))
    OR     ("namespace" = 'employer' AND "key" IN (
      'account.connected.connected_at',
      'account.emails.primary_badge',
      'account.emails.remove',
      'account.emails.resend',
      'account.emails.set_primary',
      'account.emails.verify_check_inbox',
      'account.phones.send_code',
      'account.phones.verify',
      'account.phones.verify_code_label',
      'account.profile_photo.change',
      'account.profile_photo.upload_too_large',
      'crews.edit_shift.date_time.repeat_base_help',
      'crews.edit_shift.date_time.repeat_help',
      'crews.edit_shift.date_time.repeat_label',
      'crews.edit_shift.date_time.stat.active_days',
      'crews.edit_shift.date_time.stat.total_hours',
      'crews.edit_shift.save_bar_repeat',
      'crews.new_shift.save_bar_repeat',
      'crews.new_shift.save_bar_single',
      'jobs.form_v2.validation_section_issues',
      'jobs.list_head.actions.pause_renotify_soon',
      'not_found.back_to_dashboard',
      'not_found.eyebrow',
      'not_found.subtitle',
      'not_found.title'
    ))
    OR     ("namespace" = 'landing' AND "key" IN (
      'hero.trust.line',
      'pricing.plan.enterprise.badge',
      'pricing.plan.enterprise.cta.label',
      'pricing.plan.enterprise.intro',
      'pricing.plan.enterprise.price.monthly.amount',
      'pricing.plan.enterprise.price.monthly.note',
      'pricing.plan.enterprise.price.yearly.amount',
      'pricing.plan.enterprise.price.yearly.note',
      'pricing.plan.free.badge',
      'pricing.plan.free.cta.label',
      'pricing.plan.free.intro',
      'pricing.plan.free.price.monthly.amount',
      'pricing.plan.free.price.monthly.note',
      'pricing.plan.free.price.yearly.amount',
      'pricing.plan.free.price.yearly.note',
      'pricing.plan.pro.badge',
      'pricing.plan.pro.cta.label',
      'pricing.plan.pro.intro',
      'pricing.plan.pro.price.monthly.amount',
      'pricing.plan.pro.price.monthly.note',
      'pricing.plan.pro.price.yearly.amount',
      'pricing.plan.pro.price.yearly.note'
    ))
    OR     ("namespace" = 'marketing' AND "key" IN (
      'pricing_page.plans.starter.body',
      'pricing_page.plans.starter.cta',
      'pricing_page.plans.starter.f1',
      'pricing_page.plans.starter.f2',
      'pricing_page.plans.starter.f3',
      'pricing_page.plans.starter.f4',
      'pricing_page.plans.starter.label',
      'pricing_page.plans.starter.name',
      'pricing_page.plans.starter.period',
      'pricing_page.plans.starter.price',
      'pricing_page.plans.training.body',
      'pricing_page.plans.training.cta',
      'pricing_page.plans.training.f1',
      'pricing_page.plans.training.f2',
      'pricing_page.plans.training.f3',
      'pricing_page.plans.training.f4',
      'pricing_page.plans.training.label',
      'pricing_page.plans.training.name',
      'pricing_page.plans.training.period',
      'pricing_page.plans.training.price',
      'pricing_page.plans.verified.badge',
      'pricing_page.plans.verified.body',
      'pricing_page.plans.verified.cta',
      'pricing_page.plans.verified.f1',
      'pricing_page.plans.verified.f2',
      'pricing_page.plans.verified.f3',
      'pricing_page.plans.verified.f4',
      'pricing_page.plans.verified.label',
      'pricing_page.plans.verified.name',
      'pricing_page.plans.verified.period',
      'pricing_page.plans.verified.price',
      'pricing_page.plans.worker.body',
      'pricing_page.plans.worker.cta',
      'pricing_page.plans.worker.f1',
      'pricing_page.plans.worker.f2',
      'pricing_page.plans.worker.f3',
      'pricing_page.plans.worker.f4',
      'pricing_page.plans.worker.label',
      'pricing_page.plans.worker.name',
      'pricing_page.plans.worker.period',
      'pricing_page.plans.worker.price',
      'pricing_page.plans.workforce.body',
      'pricing_page.plans.workforce.cta',
      'pricing_page.plans.workforce.f1',
      'pricing_page.plans.workforce.f2',
      'pricing_page.plans.workforce.f3',
      'pricing_page.plans.workforce.f4',
      'pricing_page.plans.workforce.label',
      'pricing_page.plans.workforce.name',
      'pricing_page.plans.workforce.period',
      'pricing_page.plans.workforce.price',
      'subprocessors.row.clerk.data',
      'subprocessors.row.clerk.purpose'
    ))
    OR     ("namespace" = 'worker' AND "key" IN (
      'documents.completeness.task.banking',
      'documents.completeness.task.photo',
      'documents.completeness.task.references',
      'jobs.browse.filter.within_25',
      'onboarding.phone.collision_other_tenant',
      'verify.coming_soon'
    ))
  );

COMMIT;
