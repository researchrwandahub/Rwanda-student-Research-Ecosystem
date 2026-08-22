# RSRE V22 — Research Opportunities UX

## Purpose
Turn the Research Opportunities pillar into a student/researcher-facing opportunity feed rather than a source directory.

## UX structure
1. For you — lightweight matching from Research Passport interests, methods, skills and discipline.
2. Act soon — active calls with deadlines within seven days.
3. Saved opportunities — browser-local saved list for quick return.
4. Full active feed — search and type filters across current opportunities.

## Product rules
- Students do not see automatic/admin source labels.
- Provider/source URL remains internal to the backend; users open the official opportunity through the existing server redirect.
- Expired opportunities remain hidden by backend filtering.
- `last_synced_at` is used only to show freshness.
- No payment is required to browse or open opportunities.
- Opportunity listings do not imply endorsement, acceptance or funding guarantee.

## Matching
Matching is intentionally lightweight and transparent: terms from the user's Research Passport are compared with the opportunity title, description and type. It is a relevance aid, not an eligibility decision.

## Separation of responsibilities
- Discovery: evidence and literature search.
- Opportunities: external calls, grants, fellowships, internships and openings.
- Incubator: real project development.
- Academy: learning and practice.
