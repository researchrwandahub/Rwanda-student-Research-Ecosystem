# V35 — Cross-Pillar Integration Final

## Shared momentum
- Academy certificate events write to Research Passport and dispatch in-app/email/WhatsApp hooks.
- Academy course completion writes Passport learning evidence and a next-step notification.
- Incubator milestone completion writes Passport milestone evidence and notifies project owner/team.
- Incubator stage changes notify the project owner with the next action.
- RSJH submission, peer review, and publication continue to append Passport evidence without changing the protected editorial workflow.
- Accepted Collaboration Network requests append Passport collaboration evidence and notify both participants.
- Unified dashboard exposes next actions from multiple pillars.

## Sponsorship protection
- Removed the legacy journal/publication sponsorship purpose from the active schema.
- Existing legacy records are normalized to General RSRE Gift by migration 0022.
- RSJH remains free; sponsorship is ecosystem support only.

## WhatsApp
- Shared notification dispatch already supports opt-in WhatsApp delivery.
- No real WhatsApp credentials are embedded. Production connection remains a deployment configuration step.
