# RSRE Final Feature Implementation Report

## 1. Exact files changed

- `backend/journal/views.py`
- `backend/journal/serializers.py`
- `backend/journal/tests/test_research_private_scope.py`
- `backend/journal/tests/test_journal_sensitive_access.py`
- `backend/journal/models.py`
- `backend/rsre_core/views.py`
- `backend/rsre_core/test_collaboration_ethics.py`
- `backend/academy/models.py`
- `backend/academy/views.py`
- `backend/academy/urls.py`
- `backend/academy/migrations/0012_course_lifecycle.py`
- `backend/academy/tests/test_lifecycle.py`
- `pages/research-sandbox.tsx`
- `pages/research-sandbox/[id].tsx`

Only the active tree under `C:\Users\user\Downloads\RSRE` was retained. Historical and GitHub-copy directories were not modified.

## 2. Features implemented

### Research Sandbox

- Workspace creation now uses the real API response.
- Workspace editing persists through `PATCH`.
- Existing notes and datasets persist through their existing APIs.
- Workspace data refreshes after note/dataset operations.
- Loading, disabled, and API-error states were added.
- Existing ownership filtering protects private workspaces.

### Collaboration

- Collaboration discovery now respects opted-in passport visibility.
- Recipient validation returns safe validation errors instead of server errors.
- Collaboration actions are limited to pending requests and authorized participants.
- Accepted requests create active project memberships where supported.
- Public collaboration responses avoid private contact fields.

### Ethics & Compliance

- Ethics assessment access is owner-scoped.
- Unauthorized ethics reads and updates return not-found behavior without exposing records.
- Existing internal workflow was preserved; no institutional approval system was fabricated.

### Academy lifecycle

- Added draft, published, and archived course states with timestamps.
- Existing active courses are preserved as published by the additive migration data transition.
- Added server-side course publication validation.
- Added publish/archive/draft lifecycle endpoint.
- Archived and draft courses are excluded from learner catalog responses.
- Added administrator preview-as-learner support.
- Added administrator certificate revocation support.

### Broader privacy and permissions

- Existing research project owner/member/editor/administrator restrictions remain enforced.
- Passport evidence ownership and edit restrictions remain enforced.
- Sensitive manuscript, review, reviewer, revision, and editorial-decision responses remain scoped.

## 3. APIs changed

### Sandbox

Existing sandbox endpoints were connected to the frontend for:

- workspace list/create/detail/update
- note creation
- dataset creation

### Collaboration and ethics

Existing RSRE collaboration and ethics endpoints were hardened for:

- public discovery visibility
- collaboration request acceptance
- participant-only actions
- owner-scoped ethics records

### Academy

Added/extended existing Academy routes:

- `POST/GET /api/academy/admin/courses/<id>/lifecycle/`
- `POST /api/academy/admin/certificates/<certificate_id>/revoke/`
- `GET /api/academy/courses/<id>/preview/`

Existing Academy admin responses now include lifecycle, learner, certificate, and related management data supported by the current architecture.

## 4. Permissions changed

- Private sandbox workspaces are accessible only to the owner or authorized existing access path.
- Project actions remain limited to owners, active members where appropriate, editors, and administrators.
- Collaboration request actions are limited to requester/recipient participants.
- Ethics assessments are owner-scoped.
- Academy lifecycle and certificate revocation actions require administrator authorization.
- Public collaboration discovery exposes only intended public identity information.
- Existing journal/editorial privacy restrictions remain in force.

## 5. Models changed

### `academy.AcademyCourse`

Added:

- lifecycle status
- published timestamp
- archived timestamp
- model-level publish/archive validation and helpers

No journal, sandbox, collaboration, or ethics model changes were required in this pass.

## 6. Migrations created

Created:

- `backend/academy/migrations/0012_course_lifecycle.py`

The migration is additive and preserves existing course visibility by mapping active courses to `published` and inactive courses to `archived`.

Migrations executed: **No**.

No PostgreSQL migration or database repair was attempted.

## 7. Tests added

- `backend/journal/tests/test_research_private_scope.py`
  - owner/member/private project access
  - private sandbox access
  - workspace update
  - note and dataset persistence
  - unauthorized sandbox operations
  - passport evidence ownership
  - external discovery failure handling
- `backend/journal/tests/test_journal_sensitive_access.py`
  - sensitive manuscript/review access control
- `backend/rsre_core/test_collaboration_ethics.py`
  - authorized collaboration action
  - private identity protection
  - unauthorized collaboration modification
  - ethics owner authorization
- `backend/academy/tests/test_lifecycle.py`
  - valid publish
  - invalid publish rejection
  - archive behavior
  - certificate lifecycle behavior

## 8. Tests actually run

Using isolated SQLite:

- `manage.py check`
  - **PASS**
- Focused tests:
  - research private scope
  - journal sensitive access
  - collaboration/ethics authorization
  - Academy lifecycle
  - registration
  - protected journal workflow
  - AI service
  - **PASS: 17 tests, 0 failures**
- Migration consistency:
  - `manage.py makemigrations --check --dry-run`
  - **PASS: No changes detected**
- Pylance diagnostics for changed Python and frontend files:
  - **PASS: no errors reported**

## 9. Exact PASS/FAIL results

- Django system checks: **PASS**
- Focused SQLite tests: **PASS — 17/17**
- Migration consistency: **PASS**
- Changed-file diagnostics: **PASS**
- Python syntax validation: **PASS**
- PostgreSQL tests: **NOT RUN**
- Frontend lint/build: **BLOCKED** because frontend dependencies are not installed and `next`/`tsc` are unavailable.

## 10. PostgreSQL blockers

The configured PostgreSQL environment previously reported:

`django.db.utils.ProgrammingError: relation "journal_user" does not exist`

Affected area: PostgreSQL schema/test initialization.

This was treated as an environment/database blocker. No reset, recreation, flush, destructive migration, or automatic repair was attempted.

## 11. Frontend blockers

The modified sandbox pages were checked for editor diagnostics successfully, but the existing frontend lint/build commands could not run because `node_modules` is unavailable and `next` is not installed in the active environment.

No unrelated dependencies were installed.

## 12. Remaining technical debt

- Full browser testing of sandbox, collaboration, ethics, and Academy lifecycle flows remains outstanding.
- PostgreSQL schema provisioning/repair must be handled through the approved database process.
- Certificate revocation and audit history may need additional business rules as the Academy lifecycle expands.
- Collaboration and ethics integrations remain limited to the internal RSRE models/APIs.
- Institutional ethics approval integration is not implemented.
- Full responsive browser validation requires frontend dependencies.

## 13. Manual testing still required

1. Create, reopen, edit, and archive a sandbox workspace from the browser.
2. Add a note and dataset, refresh, and confirm persistence.
3. Confirm another user cannot access a private workspace.
4. Send and accept a collaboration request using two authorized accounts.
5. Confirm private passport/contact fields are absent from public collaboration discovery.
6. Confirm unauthorized collaboration and ethics mutations are rejected.
7. Publish a complete Academy course and confirm it appears in learner catalog results.
8. Attempt to publish incomplete Academy content and confirm server-side rejection.
9. Archive a course and confirm it disappears from learner catalog results.
10. Preview a course as an administrator and revoke a certificate where authorized.
11. Verify author/reviewer/editor/admin manuscript and review workflows.
12. Install the project’s existing frontend dependencies and run the existing lint/build commands.

## Safety confirmation

- No database reset, flush, drop, or deletion was performed.
- No users, articles, Academy records, research records, or migrations were deleted.
- No migrations were executed against PostgreSQL.
- Registration, password validation, and previously completed work were not redone.
- No historical or GitHub-copy directories were modified.
