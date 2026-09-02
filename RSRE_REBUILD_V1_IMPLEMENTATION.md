# RSRE Rebuild V1 — Implementation Notes

## Parent/child architecture

RSRE is the parent ecosystem. RSJH remains the publication arm. The Academy, Passport, Incubator, Opportunities, Discovery, Analytics, Sandbox, MedTech AI, Ethics & Compliance and Collaboration are separate application experiences with their own navigation and dashboard routes.

## Shared platform services

- RSRE identity uses the existing `journal.User` account system.
- User email remains the canonical account email for email notifications.
- `whatsapp_number` is an editable user profile field for WhatsApp notifications.
- `rsre_core` holds platform settings, application registry, editable content, support tickets, communication preferences, notification outbox and audit events.
- `/api/rsre/` is the shared platform service namespace.
- `/api/academy/` is the Academy application namespace.
- `/api/` remains the RSJH journal API namespace.

## Administrative model

The RSRE Control Center is the top-level operational UI at `/rsre-admin` for an administrator. It is the intended place for future no-code editing of application content, platform settings, support, communication settings, certificates, and service operations.

Django admin `/admin/` remains a technical backstop, not the primary operator interface.

## Communications

Email delivery uses Django's configured email backend. WhatsApp is provider-agnostic: the operator configures a provider endpoint/token in platform settings and enables WhatsApp. No provider is hard-coded.

## Current migration order

Journal baseline ends at `0016_user_whatsapp_number`; RSRE core depends on that migration. Academy migrations are included through `0005_alter_module_slug`.
