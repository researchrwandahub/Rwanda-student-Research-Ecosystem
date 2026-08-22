# RSRE Academy V45

This is a targeted stability pass for the real completion workflow.

Fixes:
- lesson completion is retained through the existing LessonProgress system;
- assessment scoring uses only submitted question IDs;
- a passed assessment immediately finalizes the module when required lessons are complete;
- the module certificate is created and returned by the same request;
- next-module unlocking is based on the previous required module certificate, not a missing helper in views.py;
- certificate and module-pack download endpoints are provided;
- completion and unlock notifications are sent through the shared Academy notification service.

Run `apply_academy_v45_patch.ps1` from the backend directory. No migration is required.
