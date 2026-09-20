# RSRE Product Review — 2026-09-09

## What was confirmed

- `RSRE (2)` is the larger evolving source archive; `RSRE 1` is a smaller subset/copy.
- Previous local development work is still present in the active Git worktree; it was not simply lost.
- The active repository has accumulated multiple frontend generations and historical Academy upgrade material.
- RSRE, RSJH and MedTech AI were partially implemented as distinct areas but the dashboard and navigation boundaries were not always clear.
- Academy has a rich data model but many visible lessons are too short to support their stated learning duration.

## Product benchmark

IBM SkillsBuild was reviewed as a maturity reference, not as a design template. Its public materials show structured learning, stated durations, progress, practical/project-based learning and assessment-backed digital credentials.

KiraMedWell was reviewed as a peer product/reference point. Its public homepage groups many capabilities in one product and advertises several numerical claims. RSRE should take the lesson of clear product grouping but keep a distinct research identity and avoid unsupported claims.

## Changes in this working copy

### Academy

- Redesigned module learning around an outline + lesson reader + persistent progress + resources + assessment.
- Added honest learning metadata and visible completion state.
- Required the complete lesson sequence before assessment submission at both UI and backend levels.
- Added lesson content-quality metadata and administration warnings.
- Added backend baselines for active new/updated lessons: 1,200 characters for core lessons and 800 for practical activities.
- Added a non-destructive Academy content audit command.
- Fixed the quiz response bug referencing an undefined variable.

### RSRE / RSJH / MedTech AI

- Refined global navigation so the ecosystem, journal and AI/research-assistance areas are distinct.
- Kept RSJH as the publication/journal identity rather than the overall platform identity.
- Kept RSRE as the umbrella ecosystem identity.
- Kept the journal workspace distinct from the normal RSRE researcher dashboard.

### Language and UX

- Reworked visible dashboard wording toward concrete, human language.
- Reduced ambiguous labels such as a generic "Research tools" menu.
- Strengthened the mobile learning structure.
- Kept the Academy optional for experienced researchers.

### Governance

- Preserved the policy/consent implementation already recovered in the source.
- Terms/Privacy/Research Guidelines acceptance remains explicit and backend-backed.
- Editorial users retain journal-specific policy requirements.

### Technical source of truth

- Active frontend: repository-root `pages/` + `components/`.
- Active backend: `backend/`.
- Historical/alternate frontend trees remain documented and were not blindly deleted.
- GitHub and Render remain separately verifiable deployment concerns; Render settings cannot be proven from a ZIP alone.

## Not falsely declared complete

The Academy content itself still needs editorial development for the lessons currently flagged as shallow. No artificial timer or filler text was used to disguise that problem.

Live Render configuration, live PostgreSQL state and a full Next.js production build require the actual runtime/deployment environment; they were not guessed from the archive.
