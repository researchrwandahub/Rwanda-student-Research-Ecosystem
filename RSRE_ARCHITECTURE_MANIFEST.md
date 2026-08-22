# RSRE Architecture Manifest — V1

## Parent ecosystem
Rwanda Student Research Ecosystem (RSRE)

## Application pillars
Research Academy; Research Discovery; Research Analytics; Research Opportunities; Research Incubator; Research Passport; RSJH Journal; Research Sandbox; MedTech AI; Ethics & Compliance; Collaboration Network.

## Shared services
Single RSRE account; profile; permissions; notifications; email; WhatsApp provider service; support desk; editable platform settings; content registry; audit events.

## Dashboard separation
- `/rsre-admin` — one operator control center.
- `/research-academy/dashboard` — learner workspace.
- Existing RSJH author/editor/reviewer dashboards remain journal-specific.
- Future Incubator/Passport/Opportunities/Discovery workspaces are separate application dashboards.

## Core rule
One identity, many application workspaces, shared platform services, application-specific workflows.


### Protected monetization rule
Students are not charged by the RSRE/RSJH gift flow. Sponsor-side funding is optional; after payment confirmation, a recipient receives a gift code by email.
