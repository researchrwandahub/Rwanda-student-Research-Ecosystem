# Rwanda Student Journal for Health (RSJH) — Backend

RSJH is a student-centered research and health-communication platform built to guide students from research idea and mentorship through submission, peer review, reviewer feedback, revision, editorial decision, publication and communication of evidence.

## Core backend workflow

1. Student creates a manuscript draft.
2. Student submits the manuscript.
3. Editorial/admin screening begins.
4. Reviewer is assigned.
5. Reviewer downloads the manuscript and submits structured comments and a recommendation.
6. Reviewer comments visible to the author appear in the author dashboard.
7. If revision is required, the author uploads a new manuscript and response-to-reviewers document.
8. The manuscript returns to review.
9. Reviewers recommend; an editor makes the final editorial decision.
10. Accepted manuscripts are published with indexing-ready metadata.

## Responsible AI

AI is an assistance layer, not an author, reviewer replacement, or publication decision-maker.

- `AI_PROVIDER=mock` keeps development usable without paid API credits.
- Set `AI_PROVIDER` and `AI_API_KEY` when a funded API account is available.
- AI use can be logged through `AIUsageLog` with task, provider/model, input/output size, disclosure and success state.
- Authors can record AI use in `Article.ai_use_statement`.
- Human users remain responsible for accuracy, citations, originality, ethics and final decisions.

## Indexing-ready publication metadata

Article records now support DOI, license, funding statement, conflict of interest, ethics statement, data availability, AI-use statement, volume, issue, pages and citation text. These fields support a later application pathway for services such as DOAJ and DOI registration; they do not guarantee acceptance by an index.

## Migration

After deploying the code:

```bash
python manage.py migrate
```

The RSJH student-journey changes are in migration `0009_rsjh_student_journey.py`.
