# RSRE Pillar-by-Pillar Upgrade Log

## V1.1 — Research Discovery Pillar

Status: **Upgraded**

### Delivered
- Unified Research Discovery interface instead of a placeholder search box.
- Search across RSJH local publications, OpenAlex and Crossref.
- Source filter: All / RSJH / OpenAlex / Crossref.
- Exact publication-year filtering.
- Open-access filtering.
- Source availability status.
- Local RSJH results separated from global scholarly literature.
- DOI/title deduplication for external records.
- Graceful handling when an external scholarly service is temporarily unavailable.
- Search result cards with authors, journal, year, DOI, citations and access status.
- Preserved the existing read-only external discovery architecture.

### Design principle
Discovery is not just a search page. It is the RSRE entry point for:
**Question → Existing evidence → Local evidence → Research gap → Opportunity / Incubator / Academy / Publication.**

### Next pillar
Research Analytics should build on the discovery layer rather than become another isolated dashboard.


## V1.2 — Research Analytics Pillar

Status: **Upgraded**

### Delivered
- Replaced the placeholder analytics landing page with a functional research-intelligence workspace.
- Connected the UI to the existing published-research analytics APIs.
- Publication trend visualization by year.
- Research specialty distribution.
- Institution-level publication distribution.
- Disease/topic signal detection from published title, abstract and keyword metadata.
- High-level metrics for published records, represented institutions and active specialties.
- Loading and partial-failure states.
- Clear pathway from Analytics → Discovery → Research Gap → Incubator / Opportunities / Publication.
- Kept analytics read-only and grounded in published RSJH records.

### Design principle
Analytics is not a decorative dashboard. It should answer:
**What is being researched → Who is researching it → Where are the signals → What gap or opportunity should happen next?**

### Next pillar
Research Opportunities should become a real opportunity discovery and verification workflow, rather than a set of category cards.

## V1.3 — Research Opportunities upgraded

- Replaced static opportunity category cards with a live opportunity feed.
- Added automatic/manual source separation to `ResearchOpportunity`.
- Added external record identifiers and synchronization timestamps.
- Added deduplication for automatic imports.
- Added `sync_opportunities` management command using the public Grants.gov `search2` API.
- Added administrator-only create/update/delete controls for manual opportunity publishing.
- Automatically hides expired opportunities from the public feed.
- Removed provider URL from the public opportunity serializer/UI.
- Added an internal redirect action for opening the official opportunity without displaying raw website URLs in RSRE cards.
- Added Django Admin management for opportunities.
- Added documentation at `docs/RSRE_RESEARCH_OPPORTUNITIES_PILLAR.md`.

## Pillar 5 — Research Incubator (V1.3)

### Implemented in V7
- Upgraded `ResearchIdea` from a minimal note into a lifecycle-aware research idea record.
- Added Research Project workspace with owner, source idea, question, objectives, background, methodology, discipline, study type and target completion date.
- Added project stages from Developing → Protocol → Ethics & Governance → Data Collection → Analysis → Manuscript → Publication → Completed.
- Added ethics status and data-governance status so project progression reflects responsible research practice.
- Added optional mentor relationship.
- Added project team membership with research roles.
- Added project milestones with due dates and progress state.
- Added automatic project readiness score based on research definition and governance completeness.
- Added Idea → Project conversion endpoint.
- Added controlled project advancement endpoint.
- Restricted project/team modification to the project owner or administrator.
- Added Django Admin management for ideas, projects, teams and milestones.
- Rebuilt the student-facing Incubator page as a functional workspace rather than a static workflow diagram.
- Preserved optional Academy participation: researchers may enter the Incubator directly using their existing knowledge and skills.

### Lifecycle
**Idea → Evidence/Discovery → Structured Project → Team/Mentor → Protocol → Ethics/Data Governance → Research → Analysis → Manuscript → RSJH Publication → Research Passport**

### Deliberately not added yet
- Automatic mentor assignment.
- Ethics committee submission itself.
- Full project document storage/versioning.
- Advanced task notifications.
- Automated team matching.

These remain later pillars/incremental modules so the Incubator stays stable and auditable.

# Pillar 6 — Research Passport (V7)

## Purpose
The Research Passport is the researcher's longitudinal, evidence-based record across RSRE. It is a portable research identity and progression layer, not a license, degree, or mandatory Academy credential.

## What is recorded automatically
- Verified Research Academy learning records and completed courses
- Valid Academy certificates
- Research Incubator projects, active/completed projects, and completed milestones
- RSJH publications authored by the researcher
- Peer reviews completed by the researcher
- Existing RSRE evidence and administrator-verified evidence

## What researchers can add
Researchers can declare external learning, projects, publications, credentials, mentorship and collaborations. Declared evidence is explicitly labelled as researcher-declared until verified by an administrator.

## Visibility
Passport profile visibility supports private, RSRE-network, and public modes.

## Verification
Each Passport snapshot exposes an RSRE verification code and evidence score. The code represents the current RSRE record and must not be presented as a professional license, academic degree, or accreditation.

## Design principle
Research Academy participation remains optional. The Passport recognizes demonstrated work and evidence from outside RSRE as well as activity inside RSRE.


## V9 — Student Gift Sponsorship
Added an additive sponsor-funded gift flow. Students are not charged; sponsors fund gifts, payment is confirmed, then a gift code is emailed to the recipient. RSJH editorial workflow unchanged.

## Pillar 8 — Research Sandbox
- Added safe research workspaces, notes and dataset registry.
- Sandbox is separate from RSJH editorial workflow.

### V13 — MedTech AI cross-pillar layer
- Added authenticated cross-pillar AI chat endpoint.
- Added published-RSJH evidence context only.
- Extended AI safety instructions and task handling.
- Upgraded MedTech AI workspace UI.
- Preserved RSJH protected editorial workflow.

## V14 — Ethics & Compliance
- Added EthicsAssessment and EthicsResource models.
- Added researcher self-assessment API with risk signal and tailored guidance.
- Added admin-managed ethics resources.
- Added Ethics & Compliance workspace UI.
- Added notification after readiness assessment creation.
- Explicitly kept statutory/institutional ethics approval outside RSRE authority.
- Preserved Academy, Incubator, Sandbox and RSJH boundaries.
