# RSRE Platform Notification Contract

Every user-owned milestone should produce a meaningful notification through the shared `rsre_core.services.dispatch_notification` path when appropriate. Delivery can be in-app, email, and optionally WhatsApp according to user and platform configuration.

Examples include Academy enrollment, lesson/module completion, quiz/lab/assignment results, certificates, opportunities, Incubator project milestones, Sandbox changes, Passport evidence/verification, and RSJH submission/review/editorial events.

Notifications are momentum infrastructure: they should tell the user what happened and what they can do next. They must not spam the user or bypass user preferences.

Academy `progress_reminders` controls scheduled momentum reminders.


## V35 cross-pillar event layer
Certificate, milestone, publication and collaboration events can now append Passport evidence and dispatch a shared momentum notification. WhatsApp remains opt-in and deployment-configured.
