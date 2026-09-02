# RSRE Registration Implementation Report

## Scope

Implemented only registration identity and password validation in the active runtime tree. No Academy, research workflow, deployment, duplicate-folder, or broad permission changes were made.

## Exact files changed

- `backend/journal/models.py`
- `backend/journal/serializers.py`
- `backend/journal/migrations/0025_user_other_names.py`
- `backend/journal/tests/test_registration.py`
- `pages/auth/register.tsx`

## Model changes

- Added `User.other_names` as an optional `CharField(max_length=150)`.
- Existing `first_name` and `last_name` fields inherited from `AbstractUser` were reused.
- Existing `full_name` remains preserved and is now derived from the three identity name fields during new registration.
- Existing user data is preserved because the migration adds a nullable-at-form-level, blank-compatible field with no destructive operation.

## Migration

Migration created:

- `backend/journal/migrations/0025_user_other_names.py`

Migration dependency:

- `0024_passport_public_fields`

No migration was executed against the configured application database.

## Serializer/API changes

- Registration now accepts:
  - `first_name`
  - `other_names`
  - `last_name`
  - `username`
  - `email`
- First name, last name, and email are required by the backend.
- Registration derives `full_name` from the submitted identity fields.
- Password validation now requires:
  - at least 8 characters
  - one uppercase letter
  - one lowercase letter
  - one number
  - one special character
  - no occurrence of the username, case-insensitively
- Django’s configured password validators are also applied.
- Duplicate usernames and duplicate non-empty emails are rejected case-insensitively with field-specific messages.
- Existing role restrictions and editorial invitation validation remain in place.
- JWT, email verification, welcome notification, and password-reset code paths were not changed.

## Frontend changes

- Replaced the previous implicit username-based identity behavior with one visible Identity section containing:
  - Official First Name
  - Other Name(s)
  - Last Name
  - Username
  - Email
- Removed the registration payload’s fabricated `full_name: username` value.
- Added matching client-side password checks and clear messages.
- Preserved account roles, invitation controls, academic fields, and existing registration redirect behavior.

## Tests added

`backend/journal/tests/test_registration.py` covers:

- valid registration
- identity field persistence
- password hashing
- invalid password rejection
- username exclusion from password
- duplicate username rejection
- duplicate email rejection, case-insensitively

## Tests and checks actually run

- `python manage.py check`
  - PASS: system check identified no issues.
- `USE_SQLITE=True python manage.py test journal.tests.test_registration`
  - PASS: 5 tests, 0 failures.
- `python manage.py makemigrations journal --check --dry-run`
  - PASS: no unapplied model changes detected.
- Frontend `npm run lint`
  - NOT RUN successfully: the project dependencies are not installed; `next` was not recognized.
- Default PostgreSQL test invocation
  - BLOCKED by the configured database reporting `relation "journal_user" does not exist`; no application database migration or data modification was performed.

## Remaining issues

- The configured PostgreSQL test database/schema must be repaired or provisioned before running the suite against PostgreSQL.
- Frontend lint requires the existing Node dependencies to be installed.
- The separate `ReviewerRegistrationSerializer` still uses its legacy identity shape and was not broadened because this controlled fix targeted the primary `/auth/register/` flow.
- Existing users retain their current `full_name`; this change does not rewrite or migrate existing identity data.
