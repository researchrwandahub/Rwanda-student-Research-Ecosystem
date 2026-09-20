# RSRE ENGINEERING CHANGELOG — 2026-09-09

## Safety / recovery

- Audited the two uploaded ZIP archives as one evolving project.
- Preserved the existing Git worktree and did not reset or force-push anything.
- Identified root frontend as the active tracked UI surface and secondary frontend/history trees as ignored or historical.

## Identity and navigation

- Clarified RSRE as the umbrella platform identity.
- Kept RSJH as the journal/publication workspace.
- Kept MedTech AI as a supporting research/AI capability.
- Removed a stale `/community` primary navigation target in favor of the actual collaboration route.
- Separated primary RSRE dashboard routing from journal role workspaces.
- Administrators now route to `/rsre-admin`.

## Authentication

- Author/reader login now lands on `/dashboard`.
- Administrator login now lands on `/rsre-admin`.
- JWT decoding uses the existing `jwt-decode` dependency.

## Registration / policies

- Added backend-backed `PolicyAcceptance`.
- Added versioned core policy acceptance.
- Added editorial policy acceptance for reviewer/editor roles.
- Added public policy pages.
- Added explicit registration checkboxes.

## Academy

- Fixed quiz scoring so incomplete question submissions cannot produce a full score.
- Preserved the existing rich Academy architecture.
- Identified shallow lesson content as a primary content-quality issue rather than creating artificial timers.

## Verification

Static checks passed for the modified Python files and modified JavaScript files available to this environment.

Full Django/Next runtime tests were not performed because the extracted recovery workspace intentionally excludes dependency installations and live Render access was not available from the ZIP.

## 2026-09-09 — Academy depth and product-language pass

- Added `academy/content_quality.py` with a substantive lesson baseline and quality classification.
- Added `audit_academy_content` management command for non-destructive Academy QA.
- Added content-quality metadata to Academy lesson APIs and administrative course data.
- Added backend guardrails for new/updated active lessons below the content baseline.
- Fixed the quiz response bug that referenced an undefined `selected` variable after full-answer validation.
- Redesigned the active module learner view around a structured lesson outline, visible progression, realistic learning metadata, resources, practical learning language and assessment gating.
- Refined RSRE dashboard language so RSJH remains the journal/publication workspace instead of the identity of the whole ecosystem.
- Refined global navigation to make Research, Academy, collaboration, RSJH and MedTech AI distinct product areas.
- Renamed the frontend package technical name from `rmsj-frontend` to `rsre-frontend` to reduce ongoing architecture ambiguity; this does not rename the RSJH journal product.


## 2026-09-09 — Research tools hardening
- Added persistent Research Sandbox analysis-run records so the workspace no longer presents a meaningless empty "Runs" placeholder.
- Added public Research Passport presentation with explicit field-level sharing.
- Added external opportunity-source shelf with a verification/non-endorsement notice.
- Improved Research Discovery source-status transparency and metadata caveats.
