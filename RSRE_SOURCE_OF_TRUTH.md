# RSRE SOURCE OF TRUTH

## Product identities

- RSRE — Research Support and Research Ecosystem: umbrella platform.
- RSJH — Rwanda Student Journal for Health: journal/publication workspace.
- MedTech AI: research-assistance/AI capability within the ecosystem.

## Authoritative local code surface

For the active Git worktree in this archive:

- frontend: repository root `pages/` + `components/` and supporting root frontend files
- backend: `backend/`
- root configuration: `package.json`, `config/`, `utils/`, `styles/`, etc.

Secondary/historical trees exist and are intentionally ignored by Git, including:
- `frontend/`
- `v44work/`
- `v45/`
- `ACADEMY_V41_UPGRADE/`
- `ACADEMY_V42_UPGRADE/`
- generated/build/dependency folders

Do not develop against a secondary tree without explicitly documenting why.

## Git

Branch: rsre-active-implementation-2026-09-02
Remote: https://github.com/researchrwandahub/Rwanda-student-Research-Ecosystem.git

The local worktree contains substantial uncommitted implementation changes. These must be preserved and reconciled before any reset or cleanup.

## Deployment

The repository contains frontend and backend Dockerfiles but no `render.yaml`. Exact Render service configuration must be verified in Render itself.

## Navigation principle

- `/dashboard` = primary RSRE user workspace
- `/rsre-admin` = RSRE platform administration
- `/dashboard/reviewer`, `/dashboard/editor`, `/dashboard/editor-in-chief` = role-specific journal workspaces
- `/dashboard/author` should be treated as legacy/compatibility entry point unless a future architecture explicitly reassigns it

## Academy

Backend architecture supports courses, modules, lessons, quizzes, progress, certificates, labs, assignments and credits. Active content needs a depth/quality pass using the richer Academy upgrade materials already present in the archive.

## Policies

Core registration policies:
- Terms of Use
- Privacy Notice
- Research Community Guidelines

Editorial roles:
- Publication Ethics & Editorial Policy
- Reviewer / Editorial Guidelines

Policy acceptance is backend-persisted with versioning.

## Safety

Never commit or expose:
- `.env` secrets
- database passwords
- JWTs
- API keys
- Django secret keys
- Render secret values


## 2026-09-09 research-tool hardening
- Research Discovery must expose source availability and distinguish unknown metadata from negative findings. External scholarly sources remain metadata providers; users verify the original record before citing.
- Research Passport may be public only when the researcher explicitly chooses public visibility and selects fields. Private evidence is never exposed by the public endpoint. Public Passport is an identity/portfolio surface, not a professional licence, degree, ethics approval, or quality guarantee.
- Research Opportunities includes a curated external-source shelf for young researchers. RSRE does not endorse or guarantee third-party listings; every application must be verified against the organiser's official website.
- The Academy standard is based on substantive learning experiences, practical work, assessment and credible progression rather than a simple character threshold.
