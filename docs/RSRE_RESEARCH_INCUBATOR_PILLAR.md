# RSRE Research Incubator — Pillar Specification

## Purpose
The Research Incubator is the bridge between **a research idea** and **a credible research project**. It is designed for students, clinicians, academics and other health researchers who need a structured workspace rather than another learning page.

## Entry rule
Academy participation is **optional**. A user may:
1. enter from the Research Academy after learning;
2. enter from Research Discovery after identifying a gap;
3. enter directly with an existing research idea or project skill set;
4. enter from an identified research opportunity.

## Core workflow
**Capture → Refine → Discover evidence → Structure → Team → Mentor → Protocol → Ethics/Data Governance → Research → Analysis → Manuscript → Publication**

## Core records
### Research Idea
Stores the initial problem, research question, objectives, early methodology, discipline, tags and refinement status.

### Research Project
Stores the structured project and its current stage, governance status, mentor, visibility and readiness score.

### Project Team
Members can participate as co-investigator, research assistant, data analyst or advisor.

### Milestones
Projects can track concrete deliverables with due dates and progress status.

## Readiness scoring
The initial readiness score is a lightweight completion signal, not an ethical or scientific approval. It increases when the project has core research fields, a mentor and an appropriate ethics state.

A high score **does not mean a project is approved**. Ethical review, institutional requirements and scientific supervision remain separate.

## Permission model
- A normal user can see projects they own or active projects where they are a team member.
- Project owners can update their projects, manage members and milestones, and advance stages.
- Administrators have global management access.
- Academy completion is never used as a hard submission gate.

## API
- `GET/POST /api/research-ideas/`
- `POST /api/research-ideas/{id}/convert-to-project/`
- `GET/POST /api/research-projects/`
- `GET/PUT/PATCH/DELETE /api/research-projects/{id}/`
- `POST /api/research-projects/{id}/add-member/`
- `POST /api/research-projects/{id}/add-milestone/`
- `POST /api/research-projects/{id}/advance/`

## Future expansion
Mentor matching, project document versioning, protocol templates, ethics workflow integration, advanced notifications, collaboration matching and direct handoff to manuscript submission can be layered on without changing the core lifecycle.
