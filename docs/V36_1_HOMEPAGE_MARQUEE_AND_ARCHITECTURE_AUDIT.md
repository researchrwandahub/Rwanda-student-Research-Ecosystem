# RSRE V36.1 — Homepage Marquee & Architecture Audit

## Verified
- Public primary navigation exposes Home, RSJH Journal, Academy, Discovery, Opportunities, Incubator, Passport and About.
- ApplicationShell workspaces retain a direct RSRE logo/home link and now include global RSJH/About navigation, authentication controls and the shared footer.
- RSRE Control Center keeps global platform services separate from pillar administration.
- Global Content is explicitly scoped to global announcements, banners, FAQs, resources and shared notices.
- Academy has a dedicated `/research-academy/admin` curriculum builder for levels, modules and lessons.
- RSJH retains separate editorial administration for manuscripts, reviewers, editorial board, partners, founding team and publication settings.
- Research Opportunities has real filtering/matching UI and is not presented as a generic dashboard.
- Collaboration has real researcher matching and connection workflows.
- Research Sandbox has private workspaces, tools, datasets and reproducibility framing.
- Events & Training is honest about the absence of a live event service rather than presenting fake sessions.

## Homepage visual pass
- Added an auto-advancing single-image carousel using existing public imagery: `medical-students.jpg`, `healthcare-rwanda.jpg`, `gorilla.jpg`, and `medtech.jpg`.
- Carousel includes previous/next controls, slide indicators, captions and reduced-motion support.
- Added a CSS marquee-style ecosystem rail with pause-on-hover and reduced-motion support.
- Existing auth-specific/background assets and personal profile image are not promoted to the homepage carousel.

## Packaging
This release intentionally excludes `node_modules`, `.next`, Python caches and other local build caches. Run `npm install` followed by `npm run build` in the frontend directory on the development machine.
