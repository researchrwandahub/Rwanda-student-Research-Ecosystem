# RSRE V38 — Functional Depth Release

## Purpose
V38 focuses on turning the RSRE visual ecosystem into a more functional research operating system while preserving the distinct role of each pillar.

## Changes
- Unified responsive ApplicationShell with mobile navigation, active route state, RSJH + About visibility, secondary pillar navigation, sign-in/dashboard/logout.
- Added persisted Discovery saved-search state.
- Added homepage live published-article and active-opportunity previews when backend data is available.
- Added a research-action rail for Learn, Discover and Build.
- Added Sandbox workflow cues that connect experimentation to Discovery and Incubator.
- Preserved protected RSJH editorial workflow and distinct pillar routes.
- Kept homepage carousel and marquee motion with reduced-motion CSS behavior.

## Verification
Changed TSX files were syntax-transpiled successfully with the local TypeScript compiler available in the packaging environment.
A full Next.js production build remains a target-machine check because this package intentionally excludes node_modules.
