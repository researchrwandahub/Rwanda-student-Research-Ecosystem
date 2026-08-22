# RSJH V25 Final Content Guide

## Founding story and student founders
- Public pages updated: `/about` and `/founder`.
- Ten founding student demo profiles are provided.
- Replace names, roles and biographies directly in `frontend/pages/about.tsx` and `frontend/pages/founder.jsx`.
- Add photos to `frontend/public/founders/` using `student-01.jpg` through `student-10.jpg`.

## Partners & supporters
- Partner API added at `/api/partners/`.
- Administrators can add and remove partners at `/dashboard/administrator/partners`.
- Active partners are displayed automatically on the public About page.
- The About page also shows eight partner categories as editable placeholders, not claims of current partnerships.

## Co-author contributions
- Existing CRediT-style contribution UI and backend model remain in V25.
- Authors can select registered users and record contribution roles.

## Important
- No new database migration is required for the V25 final content update because the Partner and CoAuthorContribution models already exist in the V25 source.
- Backend Python files and changed TSX files were syntax-checked. A full Next.js dependency build could not be run in this environment because the package does not include node_modules and the container could not complete npm dependency installation.
