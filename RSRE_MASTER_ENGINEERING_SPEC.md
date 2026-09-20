# RSRE MASTER ENGINEERING SPECIFICATION

## Product

RSRE is the Research Support and Research Ecosystem. It is the umbrella product.

### Product boundaries

**RSRE**
- research learning
- discovery
- opportunities
- projects
- collaboration
- Research Passport
- ecosystem administration

**RSJH**
- Rwanda Student Journal for Health
- article submission
- review
- editorial decisions
- publication
- journal metadata

**MedTech AI**
- AI-assisted research tools
- research assistance/search
- optional enhancement, not the identity of the entire platform

## Frontend

Primary active surface:
- root `pages/`
- root `components/`
- root supporting frontend code

Secondary/historical trees are retained for recovery but should not be used as deployment sources without explicit architectural approval.

## Backend

Django REST backend lives in `backend/`.

Dynamic product state should come from backend APIs and PostgreSQL/database state rather than frontend hardcoding.

## Authentication

Registration -> user persistence -> policy acceptance -> verification -> login -> JWT -> profile -> role-aware routing.

Backend permissions remain authoritative.

## Academy

ACADEMY hierarchy:
Course -> Module -> Lesson -> Activity/Assessment -> Completion -> Certificate/Credit

Meaningful completion is based on learning requirements, not artificial wait timers.

## Journal

RSJH:
Submission -> Review -> Decision -> Publication

Journal workflows must remain distinct from the ordinary RSRE user workspace.

## Policies

Core:
- Terms
- Privacy
- Research Community Guidelines

Editorial:
- Publication Ethics
- Reviewer/Editorial Guidelines

Acceptance is versioned and persisted.

## Deployment

Expected chain:
Local -> GitHub -> Render -> production database.

The ZIP does not contain a complete Render declaration, so Render service configuration requires external verification.

## Security

Secrets must remain outside source control and final recovery archives.

## QA

Critical end-to-end journeys:
- registration
- login/logout
- dashboard routing
- Academy progress/quiz/completion/certificate
- research discovery
- article submission/review/publication
- policy acceptance
- production API/frontend connectivity

## Academy learning-quality benchmark — 2026-09-09

The Academy is governed by `RSRE_ACADEMY_LEARNING_STANDARD.md`. IBM SkillsBuild is used only as an external product-quality reference: its public catalogue shows substantive 60–90 minute learning experiences, learning pathways, progress tracking, practical/project-based learning in its education material, and assessment-based credentials. RSRE should adopt the underlying learning principles without copying IBM branding or UX. See the public references in the project review.

The RSRE content baseline is not a timer. Active core lessons should normally contain at least 1,200 characters, with 800 for practical activity lessons; 1,600+ characters is preferred for substantive core lessons. The actual quality test is whether the learner can understand, apply and check the concept.

The Academy now exposes lesson content-quality metadata to administration, blocks creation/update of active lessons that fall below the baseline, and provides `python manage.py audit_academy_content` for content QA. Existing shallow lessons are deliberately not deleted or silently padded; they should be revised using the richer V41/V42 curriculum material already present in the project.


## 2026-09-09 research-tool hardening
- Research Discovery must expose source availability and distinguish unknown metadata from negative findings. External scholarly sources remain metadata providers; users verify the original record before citing.
- Research Passport may be public only when the researcher explicitly chooses public visibility and selects fields. Private evidence is never exposed by the public endpoint. Public Passport is an identity/portfolio surface, not a professional licence, degree, ethics approval, or quality guarantee.
- Research Opportunities includes a curated external-source shelf for young researchers. RSRE does not endorse or guarantee third-party listings; every application must be verified against the organiser's official website.
- The Academy standard is based on substantive learning experiences, practical work, assessment and credible progression rather than a simple character threshold.
