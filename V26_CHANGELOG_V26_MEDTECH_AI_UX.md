# V26 — MedTech AI UX

## Product direction
MedTech AI is a cross-RSRE assistant layer. It changes context by pillar without replacing the purpose or permissions of the pillar.

## Frontend changes
- Redesigned MedTechAIChat as an inline workspace rather than only a floating widget.
- Added context switcher: RSRE, Academy, Discovery, Sandbox, Incubator, Writing.
- Added context-aware starter prompts.
- Added evidence disclosure UI when the API supplies evidence.
- Added explicit human-oversight guardrails.
- Improved loading/error states and responsive layout.
- Preserved existing `/api/ai/chat/` contract.
- Updated AI workspace landing page to explain context, evidence and human control.

## Safety/product boundaries
- No editorial decision support that acts as the decision maker.
- No ethics approval.
- No clinical diagnosis/treatment decisions.
- No private manuscript exposure through the general chat.
- No invented citations.
