# RSRE Academy — Credentials & Momentum

The Research Academy issues verifiable certificates at three levels without replacing the existing credential system:

1. Module completion certificate — issued when all required lessons and required assessments/labs pass.
2. Level certificate — issued when all required core modules in a level are complete.
3. Specialist pathway certificate — issued when all required pathway modules are complete.

The certificate system is additive. Existing RSJH editorial workflows and other RSRE pillars are not altered by Academy credentials.

## Notification principle

RSRE uses the shared notification dispatcher for in-app, email and optionally WhatsApp delivery. Platform events should notify users at meaningful milestones: enrollment, next module unlocked, quiz/lab/assignment feedback, module completion, certificates, opportunities, incubator milestones, sandbox activity, manuscript/review/editorial events and other user-owned state changes.

Notifications must support momentum, not spam. Academy reminders respect the user's `progress_reminders` preference. The `academy_momentum` management command can be scheduled daily.

## Optional Academy

Academy participation is optional. Existing researchers can use RSRE Discovery, Opportunities, Incubator and other pathways without being forced to complete Academy courses.
