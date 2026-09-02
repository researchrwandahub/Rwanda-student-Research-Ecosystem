# RSRE Research & Privacy Implementation Report

## 1. Exact files changed

- `backend/journal/views.py`
- `backend/journal/serializers.py`
- `backend/journal/tests/test_research_private_scope.py`
- `backend/journal/tests/test_journal_sensitive_access.py`

No frontend files, models, migrations, Academy files, registration files, deployment files, or historical-copy files were changed in this pass.

## 2. APIs changed

Existing journal APIs were hardened rather than replaced:

- Research project list/detail, update, delete, member, milestone, and workflow actions now enforce object-level access.
- Research project visibility is restricted to public projects, active members, owners, authorized editors, and administrators as appropriate.
- Project member role and source-idea ownership validation were tightened.
- Passport evidence update behavior now enforces ownership and manual-source restrictions.
- External opportunity discovery now returns safe failure responses without exposing provider exception details.
- Review, review-assignment, manuscript, revision, and editorial-decision endpoints now scope access and mutations to the relevant author, reviewer, assigned editor, editorial staff, or administrator.

No new URL declarations or database endpoints were introduced.

## 3. Permissions added or changed

- Project owners can manage their own projects, members, milestones, and supported transitions.
- Active project members receive appropriate project access without gaining owner-only management rights.
- Editors and administrators retain authorized oversight.
- Unauthorized users cannot modify or delete another user’s project.
- Reviewers can access only reviews and assignments associated with them.
- Authors cannot access confidential reviewer identities, internal review notes, editorial history, or unpublished manuscript metadata belonging to other users.
- Editorial decisions and assignment mutations are limited to authorized editorial staff and administrators.
- Passport evidence edits are limited to the evidence owner, with manual-source restrictions preserved.

## 4. Privacy protections

- Private project records are no longer exposed through broad public responses.
- Reviewer identities are anonymized where confidentiality is required.
- Private user/contact fields are redacted from serializers where they are not needed.
- Confidential review notes, editorial history, and unpublished manuscript metadata are restricted.
- Passport evidence ownership and visibility rules are enforced server-side.
- Provider error details are not leaked in external opportunity failure responses.

## 5. Research workflow connections

- Existing ResearchIdea/ResearchProject ownership relationships are validated when projects are created or updated.
- Existing project members and milestones remain the persistence layer.
- Project access now follows owner/member/editor/administrator permissions.
- Existing manuscript/editorial architecture remains intact; no replacement workflow was introduced.
- No fake persistence or simulated success responses were added.

## 6. Research Sandbox changes

The sandbox-specific work was not retained in this pass because the safe active-tree implementation could not be completed without risking overlap with unrelated changes. Existing sandbox models and APIs were not modified. Private sandbox access therefore remains a manual follow-up area.

## 7. Research Passport changes

- Evidence editing now checks ownership.
- Manual-source restrictions are enforced during evidence updates.
- Existing passport records are preserved.
- No passport model or migration changes were required.

## 8. Opportunity and discovery changes

- External opportunity failure handling now returns a safe response instead of exposing raw provider errors.
- Existing local opportunity behavior and persistence were preserved.
- No credentials or paid AI services were added.

## 9. Collaboration changes

No collaboration-specific changes were retained in this pass. Existing collaboration models and endpoints remain unchanged and require a future active-tree-only pass for deeper flow testing.

## 10. Ethics changes

No ethics/compliance-specific changes were retained in this pass. Institutional ethics integration remains outside the current application boundary and was not fabricated.

## 11. Journal/editorial changes

- Sensitive manuscript and review serializer output was narrowed.
- Reviewer identities are anonymized where the requesting user should not see them.
- Review and assignment access is scoped to the assigned reviewer, relevant author, handling editor, editorial staff, or administrator.
- Unauthorized review, assignment, and editorial-decision mutations are rejected.
- Existing legitimate author/reviewer/editor/admin workflows remain supported.

## 12. Tests added

- `backend/journal/tests/test_research_private_scope.py`
  - project privacy and owner/member permission behavior
  - passport evidence ownership behavior
  - safe external opportunity failure behavior
- `backend/journal/tests/test_journal_sensitive_access.py`
  - sensitive manuscript/review access-control behavior

## 13. Tests actually run

Using the safe isolated SQLite test setup:

- `manage.py check`
  - **PASS**
- Focused test suite:
  - `journal.tests.test_research_private_scope`
  - `journal.tests.test_journal_sensitive_access`
  - `journal.tests.test_registration`
  - `journal.tests.test_rsjh_protected_workflow`
  - `journal.tests.test_ai_service`
  - **PASS: 16 tests, 0 failures**
- Pylance diagnostics for changed Python files
  - **PASS: no errors reported**
- Python syntax compilation
  - **PASS**

## 14. Exact PASS/FAIL results

- Django system checks: **PASS**
- Focused SQLite tests: **PASS — 16/16**
- Changed-file diagnostics: **PASS**
- PostgreSQL validation: **NOT RUN**
- Frontend validation: **NOT RUN**, because frontend dependencies are unavailable and no frontend files were changed.

## 15. Database migrations

- Migrations created: **None**
- Migrations executed: **None**
- Existing data and migration history were preserved.

## 16. Remaining blockers

- The configured PostgreSQL environment still has the previously observed missing `journal_user` table issue; it was not repaired automatically.
- Research Sandbox requires a dedicated active-tree follow-up to verify page-to-API wiring and private workspace behavior.
- Collaboration and Ethics require additional targeted verification where existing infrastructure supports it.
- Full browser/API integration testing requires running services and representative user accounts.

## 17. Manual tests required

1. Log in as a project owner and create/update a project, member, milestone, and supported workflow transition.
2. Confirm an active member can access permitted project data but cannot perform owner-only actions.
3. Confirm an unrelated authenticated user cannot read or mutate a private project.
4. Confirm a private sandbox workspace is inaccessible to another user.
5. Create, edit, and delete passport evidence as the owner; repeat as another user and confirm denial.
6. Confirm private passport evidence and private project membership do not appear in public responses.
7. Test author, reviewer, editor, and administrator manuscript/review workflows with real accounts.
8. Trigger an external discovery/provider failure and confirm a safe user-facing response.
9. Confirm opportunity listing and supported save/apply actions persist through the real API.
10. Run the active frontend checks after dependencies are installed.

## 18. Scope and safety confirmation

- Only the active local tree was used.
- No historical or GitHub-copy directories were modified.
- No destructive database operations were performed.
- No users, articles, Academy records, research records, or migrations were deleted or rewritten.
- Registration, password policy, Academy, deployment redesign, and broad UI redesign were intentionally left untouched.
