# RSRE Final Ecosystem Implementation Report

## Completed

- Aligned the editable profile with the canonical registration identity fields:
  `first_name`, `other_names`, and `last_name`.
- Made `full_name` read-only at the API boundary and derive it safely when those
  identity fields change.
- Prevented non-administrators from creating users through the user-management
  API.
- Fixed reviewer-completion notifications so they exclude the submitting
  reviewer without referencing an undefined request variable.
- Preserved the existing Academy, research, sandbox, passport, collaboration,
  ethics, discovery, opportunity, and editorial implementations.

## Files changed

- `backend/journal/serializers.py`
- `backend/journal/views.py`
- `backend/journal/tests/test_registration.py`
- `pages/profile.tsx`

## Models and migrations

- No models changed.
- No migrations created.
- No migrations executed.
- Existing data and migration history were preserved.

## APIs and permissions

- `PATCH /api/profile/` now accepts the canonical name fields and derives
  `full_name`.
- `POST /api/users/` is administrator-only.
- Existing object-level research, sandbox, passport, collaboration, ethics,
  Academy, and editorial permissions were retained.

## Frontend changes

- The profile editor now presents Official First Name, Other Name(s), and Last
  Name instead of treating `full_name` as an independently editable field.
- Existing loading, error, upload, and save behavior was preserved.

## Tests added

- Profile identity updates derive `full_name`.
- Normal users cannot create users through the management endpoint.

## Validation actually run

- `python manage.py check`: **PASS**
- `python manage.py makemigrations --check --dry-run`: **PASS**
- Focused SQLite Django tests: **24 passed, 0 failures**
- Python syntax checks for changed Python files: **PASS**
- Pylance diagnostics for changed serializer/view files: **no errors**

Frontend lint/build was not run because the active tree has no installed
frontend dependencies (`next`/TypeScript are unavailable).

## Blockers and manual checks

- PostgreSQL remains blocked by the pre-existing missing `journal_user`
  relation. No PostgreSQL repair or migration execution was attempted.
- Manual browser checks remain appropriate for profile editing, mobile layout,
  Academy lifecycle, sandbox persistence, collaboration requests, ethics
  tracking, certificate verification, and editorial workflows.

## Safety confirmation

- Only the active local tree was modified.
- Protected historical/GitHub-copy folders were not modified.
- No Git reset, pull, merge, rebase, stash, or clean operation was used.
- No destructive database action, user deletion, credential addition, or paid
  AI dependency was introduced.
