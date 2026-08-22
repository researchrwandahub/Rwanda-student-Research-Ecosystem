# RSRE V1 — Course, Cohort & WhatsApp Enhancements

## Added
- FeatureComponent records so Super Admin can enable/disable/reorder application sections, cards, widgets, tools and CTAs from the Control Center API.
- Academy LessonResource records for readings, videos, tools, guidelines, templates and datasets.
- Academy CourseCohort and CourseCohortMember for cohort-based learning.
- RSRE WhatsAppCommunity / membership / message-log foundation.
- Shared notification router: in-app + email + WhatsApp for Academy and Support events.
- Meta-compatible WhatsApp Cloud API payload mode plus generic-provider mode.

## WhatsApp groups
The platform can manage the RSRE community/cohort record, members and invite URL. When an approved WhatsApp provider/account supports group creation, a provider adapter can populate `provider_group_id`; otherwise an admin creates the actual WhatsApp group in WhatsApp and pastes its invite URL. The system never falsely claims a group was created when the provider did not create one.

## Existing content preserved
The existing Academy 44-module curriculum, quizzes, certificates, labs, cases, reporting wizard and current RSJH workflows are preserved.

## Communication model
All high-value RSRE events should use the shared dispatch router. It writes in-app Notification, email outbox and WhatsApp outbox records. Actual WhatsApp delivery requires a configured provider and user WhatsApp opt-in.

## Direct WhatsApp group creation
The Control Center can request provider-side group creation through `whatsapp_group_create_url`. If the configured provider does not support group creation, the platform returns a transparent fallback: create the group in WhatsApp, paste its invite URL, then use RSRE to manage the cohort/community and send member notifications.
