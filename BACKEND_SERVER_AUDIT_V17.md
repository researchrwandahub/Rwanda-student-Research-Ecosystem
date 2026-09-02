# RSRE V17 Backend & Server Readiness Audit

## Gate
**Status: READY TO MOVE TO FRONTEND UX/DESIGN after deployment configuration is applied.**

The existing RSJH editorial workflow remains protected. This hardening pass is additive.

## Critical issues found and fixed

### 1. Duplicate journal migration leaf
The journal app contained two different migrations numbered `0020`, both depending on `0019_research_passport_v2`.

**Fixed:**
- `0020_research_sandbox.py` remains the first 0020 migration.
- `0020_student_gift.py` is now `0021_student_gift.py` and depends on `0020_research_sandbox`.

### 2. Development server in Docker
The container previously started with Django `runserver`.

**Fixed:** production Docker image now uses Gunicorn.

### 3. Production security defaults
Production-safe settings were strengthened:
- `DEBUG=False` by default.
- secure cookies in production.
- SSL redirect configurable.
- HSTS enabled in production.
- `X-Frame-Options=DENY`.
- content-type sniffing protection.

### 4. Basic API abuse protection
DRF anonymous/user throttling was added as a baseline:
- anonymous: 120 requests/minute
- authenticated user: 600 requests/minute

Specific endpoints may need tighter scoped limits later (login, password reset, AI, public search).

### 5. Health endpoint
Added `GET /health/` for deployment/load-balancer monitoring.

### 6. RSJH funding boundary
The old gift model still contained a legacy `journal_support` purpose even though RSJH is free.

**Fixed:** the model/migration and public request path now reject journal-support-as-payment semantics.

## Important backend capabilities already present

- JWT authentication with inactive/suspended-account rejection.
- Role-aware permissions for journal/editorial and RSRE admin functions.
- Research Academy learning engine, practical labs and module certificates.
- Research Discovery and analytics endpoints.
- Research Opportunities automatic sync command plus admin-created opportunities.
- Research Incubator projects, milestones and team relationships.
- Research Passport and evidence records.
- Research Sandbox workspaces/notes/datasets.
- MedTech AI service abstraction.
- Ethics self-assessment and admin-managed resources.
- Collaboration requests.
- Shared dashboard/configuration/admin services.
- In-app/email/WhatsApp notification dispatcher.
- Protected RSJH editorial workflow.

## Items not required to block frontend work, but required for production operations

### Real payment gateway / webhook
The sponsorship flow currently supports recorded sponsor requests and administrator payment confirmation. A real payment-provider webhook is **not yet implemented**.

This can be added when the actual payment provider/account is selected. It should never be connected to RSJH acceptance/publication.

### Background job queue
Notifications and external API synchronization currently run synchronously or via scheduled management commands. Production can later use Celery/RQ + Redis for reliable asynchronous delivery and retries.

### Opportunity scheduler
The sync command exists and must be attached to the server scheduler (cron, platform scheduler, or task runner). This is deployment configuration rather than missing application logic.

### File/object storage
Uploads currently use Django media storage. Production should use persistent/object storage and a CDN or protected storage policy for research files.

### Observability
Add production error tracking, structured logs, metrics, uptime monitoring and alerting when deploying.

### API documentation
OpenAPI/Swagger documentation would improve frontend integration and partner/developer onboarding. It is not required to start UX work.

## Frontend integration contract

Frontend should treat:
- RSJH API data as authoritative for manuscripts/editorial state.
- Academy API as authoritative for learning progress/certificates.
- Passport as a cumulative evidence view, not an editorial source of truth.
- Opportunity feed as active + non-expired records.
- MedTech AI as advisory assistance only.
- Notifications as the unified momentum layer.

## Explicit non-goals

This build does **not** introduce:
- pay-to-publish
- payment-dependent editorial decisions
- automatic ethics approval
- automatic authorship
- automatic RSJH submission from Sandbox
- mandatory Academy completion before research submission

## Validation performed

- Python `compileall` passed for the backend.
- Migration numbering was checked and corrected.
- Docker command changed from `runserver` to Gunicorn.
- Frontend dependencies were not installed in this environment, so a full Next.js build was not claimed.

## Recommended next phase

Proceed to the frontend information architecture, dashboard UX, responsive design system, navigation, empty/loading/error states, and visual separation between:

Academy → Sandbox → Incubator → RSJH.
