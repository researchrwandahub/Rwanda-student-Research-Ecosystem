# RSJH V26 FINAL 2

Baseline: RSJH_PLATFORM_FINAL_V26_FINAL.zip

## Administrator Dashboard
- Added Invitations & Contacts tab.
- Added Publication Settings tab directly to the custom administrator dashboard.
- Removed the old Generate Invitation Code workflow from the dashboard.
- Removed the duplicated Editorial Governance card.
- Published count now accepts either status=published or is_published=true.

## Invitations
- Reviewer, Editor, Editor-in-Chief and Partner invitation roles.
- Contact name, email and organisation fields.
- Secure invitation token and 14-day expiry.
- Email invitation is sent through Django SMTP configuration.
- Partner invitations require an organisation name.

## Publication system
- Singleton-style Journal Publication Settings API.
- Volume, issue, publication year, next article number, journal code and DOI prefix.
- Automatic article publication number.
- Automatic volume/issue assignment on editorial acceptance.
- Automatic DOI construction only when an official DOI prefix is configured.
- Automatic citation metadata.

## Migrations
- 0014_publication_and_contact_invitations
- 0015_article_publication_number

## Verification
- Backend Python files compile successfully.
- Frontend production build was not executed because node_modules is not present in the build environment.


### RSRE V1.2 — Research Analytics upgrade
- Analytics dashboard connected to existing published-research APIs.
- Added publication trend, specialties, institutions and disease signals.
