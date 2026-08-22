# RSRE V35 — Cross-Pillar Integration

V35 adds the shared momentum/event layer without replacing pillar workflows.

## Integrated events
- Academy module/level/pathway certificates -> Passport evidence + in-app/email/WhatsApp hooks
- Academy course completion -> Passport learning evidence + next-step notification
- Incubator milestone completion -> Passport milestone evidence + owner/team notifications
- Incubator stage changes -> next-action notification
- RSJH submission/review/publication -> Passport evidence through the protected journal integration
- Collaboration request lifecycle -> shared notifications

## Protection
- RSJH remains free.
- Editorial state machine is unchanged.
- Sponsorship cannot represent publication payment.
- WhatsApp credentials are not stored in the package; deployment configuration happens later.

## Remaining deployment step
Configure the WhatsApp provider, email provider, payment provider (for sponsor-side support only), background job runner and production secrets on the deployment environment.
