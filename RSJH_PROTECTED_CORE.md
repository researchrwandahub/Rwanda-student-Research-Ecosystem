# RSJH Protected Core — Pillar 7 Integration Contract

## Rule
The existing RSJH Journal is protected infrastructure. Pillar upgrades may **add** integrations, visibility, analytics, automation, and evidence recording, but must not remove, replace, bypass, or silently alter established journal workflows.

## Protected workflow
`Draft → Submit → Editor screening → Reviewer assignment → Peer review → Feedback → Revision → Editorial decision → Publication`

The current article states remain intact, including `draft`, `submitted`, `under_review`, `revision`, `editor_decision`, `accepted`, `rejected`, and `published`.

## Additive Passport integration
The new RSRE integration only records evidence after a successful existing event:

- Manuscript submission → Passport publication evidence
- Completed peer review → Passport review evidence
- Publication → Passport publication evidence with DOI/volume/issue metadata when available

The Passport does not control journal decisions. RSJH remains the source of truth for manuscript status, review assignments, editorial decisions, and publication.

## Change-control rule for future pillars
Any future modification touching `Article`, `Review`, `ReviewAssignment`, `EditorialDecision`, submission, reviewer, revision, payment/billing, publication metadata, or editorial dashboards must be additive and regression-tested against the existing workflow before packaging.
