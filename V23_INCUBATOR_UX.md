# V23 — Research Incubator UX

## Purpose
Turn the Incubator from a generic form/card dashboard into a real research project cockpit.

## Frontend changes
- Added project cockpit route: `/research-incubator/[id]`.
- Added project readiness, stage timeline, milestones, team/mentor, governance and next-action surfaces.
- Added milestone creation using the existing `add-milestone` backend action.
- Added stage progression using the existing protected `advance` backend action.
- Added clear links to Collaboration and Ethics workspaces.
- Added RSJH submission handoff only at the manuscript stage.
- Kept Academy, Sandbox, Incubator and RSJH boundaries explicit.

## Protected behavior
- No journal workflow is changed.
- No automatic publication is introduced.
- Existing Incubator API contracts are reused.
