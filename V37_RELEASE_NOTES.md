# RSRE V37 — Research OS Expansion

V37 builds on V36 with deeper product behavior rather than another generic template pass.

## Frontend upgrades
- Homepage: professional research journey, Research Passport progression, live RSJH publication previews, live opportunity previews, and a distributed four-image visual rail.
- Homepage retains V36 carousel + marquee animation and reduced-motion handling.
- Research Academy: beginner-to-professional pathway framing above the live curriculum.
- Research Opportunities: explicit category framing for Grant/Funding, Scholarship, Fellowship/Internship, and Conference/Mentorship workflows.
- Research Sandbox: distinct Notebook, Data room, and Analysis board capability framing.
- Collaboration Network: purpose-specific mentorship, co-authoring, and methods-fit framing.
- Existing RSRE navigation, RSJH, About, logout, pillar separation, and protected journal workflow are retained.

## Integrity
- Existing backend APIs were retained; no protected RSJH workflow was replaced.
- No node_modules or build caches are included.
- Changed TSX pages were syntax-validated with TypeScript's transpile pass. A full Next.js production build requires npm dependencies to be installed in the target environment.
