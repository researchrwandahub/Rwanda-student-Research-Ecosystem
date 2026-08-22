# RSRE V39 Frontend Cleanup

- Removed the second/duplicate navigation system from ApplicationShell; pillar pages now reuse the single global Header/Footer.
- Replaced the ambiguous "More" navigation with a purposeful "Research tools" menu.
- Kept RSJH Journal and About in the primary navigation.
- Removed duplicated contextual navigation strips from every ApplicationShell page.
- Fixed the public RSJH articles pagination/syntax issue and preserved published-article fallback loading.
- Preserved distinct pillar routes and the protected RSJH editorial workflow.
- Removed stale `generate_reviewer_invitation` references from the packaged backend URL configuration and validated backend Python compilation.
