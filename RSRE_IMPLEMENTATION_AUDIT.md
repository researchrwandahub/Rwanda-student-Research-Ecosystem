# RSRE Implementation Audit

## 1. Executive Summary

This repository is a working-but-fragmented hybrid of Django REST API backend and Next.js frontend. The project contains real model, API, and frontend code for the journal, academy, research workflows, and platform features, but it is not yet a single, authoritative, production-safe implementation.

The most important issue is that the repository contains multiple overlapping copies of the same platform under different folders (`/`, `/frontend`, `/frontend_backup_V38`, `/v44work`, `/RSRE/`, `/RSRE/RSRE-GITHUB/`). Those duplicates should be treated as a migration risk until an authoritative source is chosen.

The repository does have a real backend foundation and a real Academy implementation, but the current state does not satisfy the specification in the pasted requirements. In particular:

- Registration is not compliant with the required identity structure and password policy.
- The Research Academy has partial backend + UI support, but it does not let an administrator manage the full Academy from the browser without editing code.
- Some features exist as pages and forms, but are not fully wired to real backend permission checks or persisted database logic.
- There are encoding corruption issues (`â€”`, `Ã`, `ðŸ…`) in several files.
- The default secret and default local environment configuration are insecure for production.
- Duplicate implementation folders make it hard to know which code is actually authoritative.

Overall status: the project is a substantial prototype/platform scaffold, but it is not yet a production-grade, fully audited RSRE implementation.

## 2. Repository Architecture

This project combines:

- Django backend at `backend/`
- Next.js frontend at root `pages/` and `components/`
- Additional historical/duplicate copies in `frontend/`, `frontend_backup_V38/`, `v44work/`, `RSRE/`, and `RSRE/RSRE-GITHUB/`

Authoritative runtime root observed in the current working project:

- `backend/rmsj/settings.py`
- `backend/journal/`
- `backend/academy/`
- `backend/rsre_core/`
- `pages/`
- `components/`
- `utils/api.js`

Key backend configuration:

- `backend/rmsj/settings.py` sets Django settings, REST Framework, JWT config, CORS/CSRF, media/static, and environment-driven DB selection.
- `backend/rmsj/urls.py` exposes `/api/`, `/api/academy/`, `/api/rsre/`, and `/api/payments/`.
- `backend/journal/urls.py` handles auth, profile, analytics, AI, research passport, research discovery, opportunities, and router endpoints.
- `backend/academy/urls.py` handles Academy overview, admin, modules, lessons, quizzes, labs, certificates, and course actions.

The architecture is coherent in concept, but the production authority of some nested folders is uncertain and many implementations appear duplicated rather than canonical.

## 3. Feature-by-Feature Audit

### A. Registration & Authentication

STATUS: PARTIAL / SECURITY RISK

EXISTING FILES:
- `backend/journal/views.py`
- `backend/journal/serializers.py`
- `backend/journal/urls.py`
- `backend/journal/authentication.py`
- `pages/auth/register.tsx`
- `utils/api.js`

BACKEND:
- `RegisterView` exists and creates users through `UserRegistrationSerializer`.
- JWT login exists via `CustomTokenObtainPairView` and `RMSJWTAuthentication`.
- Email verification is implemented via `EmailVerificationToken` and `VerifyEmailView`.
- Password reset flow exists in the backend.

FRONTEND:
- `pages/auth/register.tsx` exists and sends registration payload to `/auth/register/`.
- It includes account role selection and invitation-based controls for editorial accounts.

DATABASE:
- `User` is the custom Django User model defined in `backend/journal/models.py`.
- `EmailVerificationToken` is present.

ACTUAL USER FLOW:
- User fills a form, submits to `/auth/register/`, receives a verification email, then signs in.

PROBLEMS:
- The registration form does not include the required identity section: `Official First Name`, `Other Name(s)`, `Last Name`, `Username`, `Email` in one identity section.
- The form sets `full_name` to the username rather than collecting explicit first/other/last names.
- There is no frontend password policy check for minimum length, uppercase, lowercase, number, special character, or username exclusion.
- The backend serializer does not call `validate_password()`; it validates only role and invitation. It does not enforce the required password rules.
- Submission is not blocked when password is invalid because the serializer never validates or rejects weak passwords.
- The requested identity fields are not represented as a single field set in a clean registration schema.

REQUIRED FIX:
- Add explicit first_name, other_names, last_name fields (or equivalent canonical fields) to the registration form and serializer.
- Enforce and test the full password policy on both frontend and backend.
- Block invalid registration submissions before calling the API.
- Ensure exactly one identity block is rendered on the page.

### B. User Profiles / Research Identity

STATUS: PARTIAL

EXISTING FILES:
- `backend/journal/models.py`
- `backend/journal/serializers.py`
- `backend/journal/views.py`
- `pages/profile.tsx`

BACKEND:
- The User model includes `full_name`, `institution`, `university`, `department`, `discipline`, `academic_stage`, `orcid`, `biography`, etc.

FRONTEND:
- Profile pages exist and can render profile data.

PROBLEMS:
- There is no enforced canonical identity schema matching the required official names structure.
- Profile editing appears to allow broad fields but not a strict identity model with unique first/other/last sections.

REQUIRED FIX:
- Normalize identity collection and storage.
- Ensure `full_name` is derived or validated consistently and does not duplicate fields in UI.

### C. Dashboard

STATUS: PARTIAL

EXISTING FILES:
- `pages/dashboard.tsx`
- `pages/dashboard/admin.tsx`
- `pages/dashboard/administrator/index.tsx`
- `components/DashboardLayout.tsx`
- `backend/journal/views.py` (`AuthorDashboardView`, role-specific dashboard logic)

BACKEND:
- Role-based dashboard endpoints are present.
- Authorization checks exist for administrative actions and redirect flows.

FRONTEND:
- Dashboard pages exist for admin/editor/reviewer/author.

PROBLEMS:
- The presence of pages does not guarantee the data model is coherent or complete for each role.
- Some dashboard flows appear to be route redirect wrappers rather than deeply connected functional views.

REQUIRED FIX:
- Trace each dashboard page to real API data and verify all options correspond to live permissions and model objects.

### D. Research Academy

STATUS: PARTIAL / BROKEN for full specification

EXISTING FILES:
- `backend/academy/models.py`
- `backend/academy/views.py`
- `backend/academy/urls.py`
- `backend/academy/serializers.py`
- `pages/research-academy/admin.tsx`
- `pages/research-academy/index.tsx`
- `pages/research-academy/dashboard.tsx`
- `pages/research-academy/module/[id].tsx`
- `pages/research-academy/labs/[id].tsx`
- `pages/research-academy/certificates.tsx`

BACKEND:
- Level, pathway, course, module, lesson, quiz, question, choice, enrollment, lesson progress, and certificate models exist.
- Academy admin APIs exist for level/module/lesson/question management (`AcademyAdminCoursesView`, `AcademyAdminLevelDetailView`, `AcademyAdminModuleView`, etc.).
- Certificate issuance and verification logic exist (e.g., `LevelCertificate`, `ModuleCertificate`, `PathwayCertificate`, `CertificateVerifyView`).
- Completion rules are implemented in `module_completed()`, `module_unlocked()`, `level_completed()`, etc.

FRONTEND:
- `pages/research-academy/admin.tsx` creates levels, modules, and lessons via API calls.
- There are dashboard/index/module/certificate page files.

ACTUAL USER FLOW:
- Administrator loads the Academy admin page, adds levels/modules/lessons, learner accesses module page, marks lessons complete, and receives certificates on completion.

PROBLEMS:
- The page `pages/research-academy/admin.tsx` is not a full browser-managed Academy administration suite. It is limited to levels/modules/lessons and badges.
- There is no browser UI for full pathway management, course management, assessment/publish validation, labs, certificate template management, certificate revocation, learner enrollment filters, audit/history, or preview-as-learner.
- The backend exists for more of this, but not all of it is surfaced in the UI.
- The requirement says the admin must manage the Academy without editing source code. This is not currently true for the full feature set.
- There is no clear evidence of a full publish/review/archive state engine in the browser flow.
- There is no full question-bank UI matching the specification.
- There is no clear evidence of full certificate template management or public verification page set up in a complete production-ready way.

CONCLUSION:
- This feature is real and partially functional, but it does not satisfy the full Academy specification. It is PARTIAL, not WORKING.

REQUIRED FIX:
- Expand the admin UI to cover pathways, course hierarchy, labs, assessment controls, certificates, publish/review/archive states, learner records, and preview capability.
- Enforce server-side validation before publishing or issuing certificates.
- Add a complete admin workflow for a real Academy content lifecycle.

### E. Research Discovery

STATUS: WORKING / PARTIAL

EXISTING FILES:
- `pages/research-discovery.tsx`
- `backend/journal/views.py` (`ResearchDiscoveryView`, `ExternalOpportunityDiscoveryView`)
- `backend/journal/urls.py`

BACKEND:
- External discovery is partially wired through scholarly search patterns and local RSJH records.

FRONTEND:
- Search page exists and makes calls to `/research-discovery/`.

PROBLEMS:
- This may work as a research lookup tool, but it depends on external services and should fail gracefully. A failure path exists but should be validated against all external dependencies.

REQUIRED FIX:
- Verify graceful degradation for OpenAlex/Crossref failures, and ensure the page continues to work without breaking the rest of the platform.

### F. Research Gap Assistance, Research Idea Engine, Research Incubator, Research Projects, Project → Manuscript bridge

STATUS: PARTIAL

EXISTING FILES:
- `backend/journal/models.py` defines `ResearchIdea`, `ResearchProject`, milestones, members.
- `backend/journal/views.py` contains `ResearchIdeaViewSet`, `ResearchProjectViewSet` routes.
- `pages/research-incubator.tsx` exists.
- `pages/research-hub.tsx` and related pages exist.

BACKEND:
- The research project workflow is present in models and API.

FRONTEND:
- A project incubator and idea intake UI exists.

PROBLEMS:
- It is likely a strong prototype, but the real end-to-end publication bridge is not clearly complete or fully validated.
- Many project pages exist, but user flow traceability from project to manuscript to editorial review should be confirmed before calling it working.

REQUIRED FIX:
- Audit each project and manuscript state transition with actual model + permission + page trace.

### G. Research Sandbox

STATUS: PARTIAL

EXISTING FILES:
- `backend/journal/models.py` (`ResearchSandboxWorkspace`, `ResearchSandboxNote`, `ResearchSandboxDataset`)
- `backend/journal/urls.py` router includes `ResearchSandboxWorkspaceViewSet`
- `pages/research-sandbox.tsx`

PROBLEMS:
- The page is a UI prototype and likely behaves as a basic workspace, but it is not guaranteed to be complete or robust.

### H. Ethics & Compliance

STATUS: PARTIAL

EXISTING FILES:
- `backend/rsre_core/models.py` includes `SupportTicket`, `NotificationOutbox`, `WhatsAppCommunity`, etc.
- `pages/ethics-compliance.tsx` exists.

PROBLEMS:
- Ethics and governance pages appear present, but the full workflow and enforcement model require verification.

### I. Collaboration Network

STATUS: PARTIAL

EXISTING FILES:
- `pages/collaboration.tsx`
- `backend/journal/models.py`/views include partnerships, board membership, research profiles.

PROBLEMS:
- Collaboration features exist structurally, but full end-to-end collaboration workflows require deeper verification.

### J. Research Opportunities

STATUS: PARTIAL

EXISTING FILES:
- `backend/journal/models.py` (`ResearchOpportunity`)
- `backend/journal/views.py` (`ResearchOpportunityViewSet`, `ExternalOpportunityDiscoveryView`)
- `pages/research-opportunities.tsx`

PROBLEMS:
- The data model and UI are present, but external/integration reliability and role permissions need verification.

### K. Research Passport

STATUS: PARTIAL

EXISTING FILES:
- `backend/journal/models.py` (`ResearchPassport`, `PassportEvidence`)
- `backend/journal/views.py` (`ResearchPassportView`, `PassportEvidenceView`)
- `pages/research-passport.tsx`

PROBLEMS:
- Passport appears structurally implemented but needs stronger validation on evidence and visibility rules.

### L. Journal / Publication

STATUS: PARTIAL

EXISTING FILES:
- `backend/journal/models.py` (`Article`, `Review`, `EditorialDecision`, `PublicationSettings`)
- `backend/journal/views.py`
- `backend/journal/serializers.py`
- `pages/submit.tsx`, `pages/review.tsx`, `pages/dashboard/reviewer/review/[id].tsx`, `pages/dashboard/author/manuscript/[id].tsx`

BACKEND:
- Real article and review lifecycle is implemented.

PROBLEMS:
- The project presents the platform as `RSJH` and also uses `Rwanda Student Journal for Health` naming in some places, but the global platform branding should remain `Research Support & Research Ecosystem (RSRE)` and the publication component should be presented as `Journal` with RSJH as the title option.
- A global RSRE brand is not consistently enforced.

### M. Editorial Workflow / Reviewer Workflow

STATUS: PARTIAL

EXISTING FILES:
- `backend/journal/models.py`
- `backend/journal/views.py`
- `pages/dashboard/administrator/...`
- `pages/dashboard/reviewer/...`

PROBLEMS:
- These flows exist but appear to rely on a combination of direct model logic and UI patterns. They should be tested for role enforcement and actual editorial state transitions.

### N. Research Analytics

STATUS: PARTIAL

EXISTING FILES:
- `backend/journal/views.py` analytics endpoints
- `pages/research-analytics.js`

PROBLEMS:
- Real analytics endpoints and some page UX are present, but they are not necessarily fully connected for all features and should be audited against real data usage.

### O. Notifications

STATUS: PARTIAL

EXISTING FILES:
- `backend/journal/notifications.py`
- `backend/rsre_core/models.py` (`NotificationOutbox`)
- `pages/notifications.tsx`

PROBLEMS:
- Notification infrastructure exists, but the end-to-end reliability needs to be confirmed and production SMTP/WhatsApp settings must be controlled by environment variables.

### P. Admin / RSRE Control Center

STATUS: PARTIAL / SECURITY RISK

EXISTING FILES:
- `pages/dashboard/admin.tsx`
- `pages/rsre-admin/index.tsx`
- `backend/rsre_core/models.py`
- `backend/rsre_core/views.py`

PROBLEMS:
- Some admin pages exist, but the repository has many duplicate UI implementations and a risk that some admin screens are only partial wrappers or redirects.
- Authorization must be enforced consistently on the backend, not only in the frontend.
- The project must verify administrator/editor/reviewer/author/reader permissions on all sensitive endpoints.

## 4. Research Academy Deep Audit

### Academy status: PARTIAL / NOT FULLY COMPLIANT

The Academy is the most mature implemented learning feature, but it still falls short of the specification.

WHAT EXISTS:
- `backend/academy/models.py`: Level, SpecialistPathway, AcademyCourse, Module, Lesson, Quiz, Question, Choice, Enrollment, LessonProgress, certificate models, badge models, labs, assignments.
- `backend/academy/urls.py`: admin routes for Academy learning management.
- `backend/academy/views.py`: module completion, quiz submission, certificate issuance, admin management endpoints.
- `pages/research-academy/admin.tsx`: working UI for creating Levels, Modules, and Lessons.
- `pages/research-academy/index.tsx`: learner Academy landing page.
- `pages/research-academy/module/[id].tsx`: learner module detail page.

KEY FINDING:
- An administrator can create and edit some Academy content from the browser, but the browser workflow is not comprehensive enough to satisfy the full requirement set.

MISSING OR UNDERIMPLEMENTED BROWSER ADMIN CAPABILITIES:
- pathway CRUD from the UI
- course CRUD from the UI
- labs management UI
- assessment validation and publication gating
- certificate template configuration
- certificate revocation and restore history
- preview-as-learner workflow
- audit/history/versioning for content changes
- role-based admin enforcement beyond the minimal Academy admin checks
- learner progress analytics and filtering in an admin dashboard
- full question-bank management with multi-choice/true-false/short answer options and validation rules

Conclusion:
- No — an RSRE administrator cannot fully manage the complete Research Academy from the browser without editing source code.

## 5. Authentication & Registration Audit

STATUS: PARTIAL / SECURITY RISK

Findings:
- JWT auth exists and is configured in `backend/rmsj/settings.py`.
- Custom user model is active.
- Verification flow exists.
- But the registration UX does not match the required identity format.
- Backend password validation is missing the requested requirements.
- The frontend has no live password validation.
- There is no single canonical identity section rendering exactly the required fields.

## 6. Research Workflow Audit

STATUS: PARTIAL

The repository contains real structure for research ideas, projects, manuscript workflows, opportunities, sandbox, passport, and incubator work. However, the end-to-end traceability and true production completeness need validation before classifying these as fully working.

## 7. Journal & Editorial Audit

STATUS: PARTIAL

The platform has real article, review, assignment, and editorial decision models and pages. The workflow is serious and promising, but it is not fully audited yet for role enforcement, assignment integrity, and production editorial safety.

## 8. Admin Control Center Audit

STATUS: PARTIAL / SECURITY RISK

Administrative routes exist, but they must be validated against user roles and permission checks. Do not rely on the presence of buttons on the frontend as evidence of backend enforcement.

## 9. Security & Privacy Audit

STATUS: SECURITY RISK

Findings:
- `backend/rmsj/settings.py` falls back to a default `SECRET_KEY` value if the environment variable is missing.
- Password policy is not enforced in the registration serializer.
- Role-based permissions must be checked on all admin endpoints rather than relying on UI hiding.
- Some features use environment configuration, but not all external integrations are guaranteed to fail gracefully or remain isolated from the main app.
- The platform exposes a lot of feature status through the UI without clear access control verification.
- Private learner/account information must be protected more tightly and should not be displayed in public verification or public learning views.

## 10. External Integration Audit

STATUS: PARTIAL / SECURITY RISK

The codebase imports or references external scholarly data sources and messaging/notification infrastructure, but optional integrations must remain controlled by environment variables and fail gracefully without breaking the entire platform.

Examples include:
- external discovery/search routines in journal views
- email and notification configuration in `settings.py`
- notification and WhatsApp-related configuration in platform models

REQUIRED FIX:
- Ensure all optional services are environment-gated.
- Ensure missing keys or failed services return safe user-facing errors without crashing the platform.

## 11. Duplicate Code Audit

STATUS: DUPLICATED

Duplicate implementations are present in multiple folders, including:
- `/frontend`
- `/frontend_backup_V38`
- `/v44work`
- `/RSRE/`
- `/RSRE/RSRE-GITHUB/`

Further evidence:
- The same page names exist under multiple root folders.
- The root backend is separate from nested duplicated backend trees.
- Multiple copies of the same app/route structure exist.

This is a high-risk issue. Before implementation starts, the project must identify the authoritative source tree.

## 12. Encoding / Code Quality Audit

STATUS: BROKEN

Examples of encoding corruption exist, including literal sequences like:
- `â€”`
- `Ã`
- `ðŸ…`

Examples were found in:
- `backend/academy/views.py`
- `backend/journal/models.py`
- `backend/rsre_data.json`

This is not harmless text noise; it indicates data/encoding drift that may affect notifications, user-facing strings, and certificate text.

REQUIRED FIX:
- Normalize file encoding to UTF-8.
- Replace corrupted punctuation and symbols with the intended correct characters.
- Audit content generated from string templates before production release.

## 13. Database & Migration Risks

STATUS: PARTIAL / RISK

The project has many migrations and models for a large platform, which is promising. However:

- The duplicates make it unclear which database schema is authoritative.
- The repository should not be migrated or reset without an explicit canonical source selection.
- Existing data must be preserved and a migration plan must be created before heavy changes.

The repository specifically warns against deleting existing data, dropping migrations, or resetting the database. That must be respected.

## 14. Production / Deployment Audit

STATUS: PARTIAL / SECURITY RISK

Examples:
- `Dockerfile` uses a Node dev server (`npm run dev`), which is not a production deployment configuration.
- `package.json` is configured for a Next.js app but not for a hardened production build pipeline.
- `backend/rmsj/settings.py` contains default secret and database values that are not safe for real production use.
- `.env.example` is minimal; a production environment must include stricter, explicit values for all required integrations.

REQUIRED FIX:
- Create a production-safe deployment path, not just a dev environment.
- Make all env variables explicit and documented.
- Separate local dev, staging, and production configuration.

## 15. Priority Matrix

High priority:
- Fix identity & password registration validation
- Resolve duplicate-authority issue in repo structure
- Fix Academy admin compliance gap
- Enforce backend authorization on all sensitive endpoints
- Correct encoding corruption and verify user messages
- Harden production environment and secrets

Medium priority:
- Complete academy feature matrix
- Complete research project lifecycle and manuscript bridge
- Improve analytics and search resilience
- Improve collaboration and passport data integrity

Lower priority:
- Cosmetic UX cleanup and branding consistency
- Content and page polish
- Additional external integration quality work

## 16. Recommended Implementation Sequence

PHASE 1 — Critical backend/security/data integrity
- Choose authoritative source tree
- Fix database and migration risk
- Harden auth and permission enforcement
- Remove or isolate duplicates

PHASE 2 — Registration/authentication
- Add explicit identity section
- Enforce password policy on frontend and backend
- Restore verification and login flow reliability

PHASE 3 — Research Academy administration
- Complete Academy admin UI coverage
- Add publish/review/archive state logic
- Add lab and assessment validation
- Add certificate template and verification lifecycle

PHASE 4 — Core research workflow
- Research idea → project → manuscript lifecycle
- Research sandbox and passport integration
- Research incubator data integrity

PHASE 5 — Journal/editorial workflow
- Role-based editorial review
- Assignment handling
- Publication settings and article lifecycle

PHASE 6 — Discovery/integrations
- External scholarly integration resilience
- Research opportunity feed reliability

PHASE 7 — Passport/identity/collaboration
- Passport evidence validation
- Collaboration network and public identity model

PHASE 8 — UI/UX/branding
- Standardize RSRE branding and `Journal` presentation rules
- Align pages with one canonical platform identity

PHASE 9 — QA/testing
- Unit/integration tests for registration, auth, Academy admin, identity, and publication flow

PHASE 10 — Production deployment
- Harden env and security settings
- Build production Docker/deployment configuration
- Validate email/WhatsApp and API failures

## Final Assessment

The repository is not empty, and it is not fake. It contains a real Django + Next.js platform with substantial feature scaffolding. However, it is not yet a complete, consistent, spec-compliant RSRE implementation.

The main issue is not absence of work—it is fragmented maturity and ambiguity:

- real code exists,
- many features are present,
- but some are duplicated,
- some are partial,
- some are missing required admin capability,
- and some are not secure or compliant enough for production.

The correct next step is not a rewrite. The correct next step is a controlled audit and authoritative-source cleanup, followed by implementation in the correct runtime tree.

## Files most likely to change first

- `backend/rmsj/settings.py`
- `backend/journal/models.py`
- `backend/journal/serializers.py`
- `backend/journal/views.py`
- `backend/journal/urls.py`
- `backend/academy/models.py`
- `backend/academy/views.py`
- `backend/academy/urls.py`
- `pages/auth/register.tsx`
- `pages/research-academy/admin.tsx`
- `utils/api.js`
- `package.json`
- `Dockerfile`

## Risk summary

- Duplicate implementation risk
- Database authority ambiguity
- Registration compliance failure
- Academy admin incompleteness
- Encoding corruption
- Production security gaps
- Partial feature wiring

This audit has intentionally stopped before implementation. No code changes, migrations, or delete/restructure operations were performed.
