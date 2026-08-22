# RSRE V1 — Courses, Components, Cohorts & WhatsApp Release Notes

## What was added

### Research Academy
- Structured lesson resources (reading, video, tool, guideline, template, dataset)
- Cohort-based learning with capacity, dates and membership
- Cohort WhatsApp community linkage
- Module detail payload now exposes learning components/resources/lab/discussion counts
- Existing 44-module curriculum, quizzes, certificates, labs, cases and reporting wizard remain intact
- `sync_academy_resources` migrates existing `resource_urls` JSON into structured resource records

### RSRE component management
- FeatureComponent records for each ecosystem sub-web
- Components can be enabled/disabled/reordered/edited through the RSRE admin API / Django admin
- Seeded component registry covers Academy, Discovery, Analytics, Incubator, Opportunities, Passport, RSJH, Sandbox, MedTech AI, Ethics and Collaboration

### Communications
- Shared notification router: in-app + email + WhatsApp
- Existing RSJH notification events can route through the RSRE notification service
- Support replies route through the same notification service
- WhatsApp provider adapter supports Meta-compatible text payload mode and a generic provider mode
- Notification outbox stores channel, event key, status, provider message id, errors and metadata

### WhatsApp communities
- RSRE community/cohort records
- Membership tracking
- Invite URL storage
- Member broadcast endpoint with outbox logging
- Optional provider-side group creation endpoint hook configured from Admin
- Honest fallback when a provider cannot create a group: create the group in WhatsApp, paste its invite URL, then manage the community from RSRE

## Admin-first principle
Course resources, cohorts, component cards, platform WhatsApp settings, communities, support and notifications are represented as managed data. The frontend does not need code changes for ordinary content/admin operations.

## Security/consent
WhatsApp delivery requires a user WhatsApp number and WhatsApp notification opt-in. Provider credentials stay in server-side configuration; they are never returned as readable values from the public configuration endpoint.
