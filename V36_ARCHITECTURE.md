# RSRE V36 — Distinct Pillars Architecture

## What changed
- One global navigation now keeps Home, RSJH Journal and About visible across applications.
- ApplicationShell carries the RSRE logo and home link on every pillar page.
- RSRE Control Center is administration-only; research work remains inside each pillar.
- Application Control now auto-seeds the real RSRE pillar registry when the admin/config APIs are opened.
- Academy administration is linked as a dedicated curriculum builder.
- RSJH administration remains a distinct editorial workspace.
- Platform Content is explicitly limited to global RSRE banners, FAQs, announcements and shared pages.
- Support, Communications, Settings and Audit remain shared platform services.
- Events & Training is no longer an empty template page; it has a distinct purpose and clear relationship with Academy and expert learning.
- Homepage restored visual imagery using existing medical/health imagery.
- Unwanted placeholder partner image assets were removed from `frontend/public/partners/`.

## Pillars
Academy · Discovery · Opportunities · Incubator · Sandbox · Passport · Collaboration · Ethics · MedTech AI · RSJH

## Run
Backend: `python manage.py runserver 127.0.0.1:8000`
Frontend: `npm run dev`
