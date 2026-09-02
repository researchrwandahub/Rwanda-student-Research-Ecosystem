# RSRE Git Structure Report

## 1. Active implementation root

`C:\Users\user\Downloads\RSRE`

This is the current local implementation tree. It is not itself a Git working tree.

## 2. Git repository root

`C:\Users\user\Downloads\RSRE\RSRE\RSRE-GITHUB`

The nested repository is a separate Git checkout. No files were moved, copied, staged, committed, pushed, or synchronized during this inspection.

## 3–5. Nested repository metadata

- Remote: `https://github.com/researchrwandahub/Rwanda-student-Research-Ecosystem.git`
- Current branch: `rsre-platform-upgrade`
- Tracking branches:
  - `main` tracks `origin/main`
  - `academy-v45-integration` points to commit `80c4e82`
  - current `rsre-platform-upgrade` has no displayed upstream
- HEAD: `416e8c4ad338be5799067908db3d5fce91b1d1fd`
- Latest commit: `416e8c4` — `Polish RSRE branding and research workflow`
- Latest commit date: `2026-08-24T18:57:04+02:00`
- Tracked file count: `615`
- Working tree: not clean:
  - modified: `backend/journal/models.py`
  - modified: `backend/journal/serializers.py`
  - modified: `backend/rmsj/settings.py`
  - modified: `pages/auth/register.tsx`
  - untracked: `backend/journal/migrations/0025_user_other_names_alter_user_first_name_and_more.py`

## 6–9. Tree comparison

A read-only content comparison was performed between the active root and the nested repository, excluding `.git`, `.next`, `node_modules`, `.venv`, and the explicitly protected duplicate trees from the active side.

Comparison counts:

- Active files considered: `572`
- Nested Git files considered: `703`
- Active-only paths: `143`
- Git-only paths: `274`
- Identical paths: `69`
- Different-content paths: `360`

### Important active-only files

These exist in the active implementation but not at the corresponding nested-repository path:

- `backend/academy/migrations/0012_course_lifecycle.py`
- `backend/journal/migrations/0024_passport_public_fields.py`
- `backend/journal/migrations/0025_user_other_names.py`
- `backend/academy/tests/test_lifecycle.py`
- `backend/journal/tests/test_registration.py`
- `backend/journal/tests/test_research_private_scope.py`
- `backend/journal/tests/test_journal_sensitive_access.py`
- `backend/rsre_core/test_collaboration_ethics.py`
- `backend/rsre_payments/tests.py`
- `backend/rsre_core/...` and `backend/rsre_payments/...` implementation additions represented by the differing files below
- `RSRE_FINAL_ECOSYSTEM_COMPLETION_REPORT.md`
- `RSRE_FINAL_HARDENING_REPORT.md`

The active-only set also contains local data, secrets, caches, backups, and reports. Those are not all implementation files and must not be committed blindly.

### Important Git-only files

The nested repository contains paths absent from the active root, including:

- `backend/journal/migrations/0025_user_other_names_alter_user_first_name_and_more.py`
- `backend/journal/migrations/0024_article_research_project.py`
- `pages/research-sandbox/[id].tsx`
- `components/Header.tsx`
- `components/ThemeToggle.tsx`
- multiple historical `v45`, `frontend`, documentation, PDF, and upgrade-artifact trees

Many Git-only paths are historical/upgrade artifacts or belong to the nested repository's different layout. The combined `0025...alter_user_first_name...py` migration is not the same path/content as the active `0025_user_other_names.py`; neither should be substituted automatically.

### Important identical files

Representative identical paths include:

- `package.json`
- `backend/manage.py`

The full identical set is a comparison result, not a recommendation to synchronize trees.

### Important differing files

The following active application files exist in both trees but differ in content:

- `Dockerfile`
- `backend/.env.example`
- `backend/rmsj/settings.py`
- `backend/rmsj/urls.py`
- `backend/journal/models.py`
- `backend/journal/serializers.py`
- `backend/journal/views.py`
- `backend/academy/models.py`
- `backend/academy/views.py`
- `backend/rsre_payments/views.py`
- `pages/auth/register.tsx`
- `pages/profile.tsx`
- `pages/support-rsre.tsx`
- `pages/research-sandbox.tsx`
- `components/Header.js`
- `config/site.ts`
- `lib/auth.js`
- `utils/api.js`

## 10. Important local changes missing from Git

Based on content and structure, the active tree contains newer local implementation work not represented by the nested repository's committed state, including:

- canonical registration identity and password-policy work;
- Academy lifecycle migration and tests;
- research/private-data, sandbox, passport, collaboration, ethics, and editorial hardening;
- payment/support API privacy and pending-state behavior;
- configurable WhatsApp support;
- profile identity derivation and user-management restrictions;
- final ecosystem and hardening reports;
- active frontend support/payment and branding updates.

This classification is based on the active files, focused tests, migrations, and reports—not timestamps alone.

## 11. Important Git changes missing from local

The nested repository contains historical or alternate implementation artifacts not present in the active root, especially:

- its combined registration migration filename;
- `pages/research-sandbox/[id].tsx`;
- `components/Header.tsx` and `components/ThemeToggle.tsx`;
- `v45` Academy upgrade artifacts;
- nested `frontend` project and extensive historical documentation.

These should be treated as alternate/older or historical material until independently reviewed. They must not be copied into the active tree automatically.

## 12. Standalone project completeness

Yes. The active root is structurally complete enough to be version-controlled as its own project:

- `package.json`: present
- `pages/`: present
- `components/`: present
- `utils/`, `lib/`, `config/`: present
- `backend/manage.py`: present
- `backend/requirements.txt`: present
- backend settings, URLs, apps, tests, and migrations: present
- `Dockerfile`: present

`backend/requirements-prod.txt` is absent, but it is not required for the current Django project structure because `backend/requirements.txt` exists.

## 13. Safest future way to put the active implementation under Git

Do not copy the nested `.git` directory into the active root and do not synchronize from GitHub.

The safest future process is:

1. Preserve the active root as the source of truth.
2. Create a new Git repository at the active root, or use a separately prepared repository whose initial tree is explicitly built from the active root.
3. Add a carefully reviewed root `.gitignore`.
4. Exclude secrets, local databases, dumps, generated caches, virtual environments, `.next`, `node_modules`, backups, historical folders, and reports unless intentionally desired.
5. Stage an explicit allowlist of application and test files, not `git add .`.
6. Review `git diff --cached`, commit once, and only then configure/push a remote after confirming its history relationship.

If preserving the existing GitHub history is required, perform a deliberate import/migration using a temporary clone and explicit path mapping; do not overwrite the active tree or merge the nested checkout blindly.

## 14. Files/directories that must not be copied or committed

- `RSRE/`
- `RSRE/RSRE-GITHUB/`
- `frontend/`
- `frontend_backup_V38/`
- `v44work/`
- `backend/.env`
- `backend/db.sqlite3`
- `backend/rsre_data.json`
- `backend/rsre_full.dump`
- `backend/rsre_production_data.dump`
- `node_modules/`
- `.next/`
- `.venv/`
- `__pycache__/`
- `*.pyc`
- `*.tsbuildinfo`
- backup files such as `*.backup` and `*.before-*`
- temporary comparison artifacts
- any file containing credentials or local production configuration

Reports and historical documentation should be excluded unless intentionally selected as project documentation.

## 15. Risks

- The nested repository is not the active root and is already dirty; staging it would mix unrelated historical/local work.
- The two trees contain same-named files with materially different implementations.
- Migration filenames differ; copying or renaming migrations could break migration history or duplicate schema operations.
- The active tree contains secrets, databases, dumps, generated files, and backups that are unsafe to commit.
- A future push from the active implementation cannot safely target the existing remote history without first deciding whether to create a new root history or perform a reviewed history-preserving import.
- The active root currently has no Git metadata, so `git status`/diff checks must be run only after an intentional repository setup.

## Safety confirmation

- No Git operation changed repository state.
- No file was moved, copied, deleted, renamed, synchronized, staged, committed, pushed, pulled, reset, merged, rebased, stashed, or cleaned.
- No PostgreSQL or application database operation was performed.
- Only this requested report was created in the active root.
