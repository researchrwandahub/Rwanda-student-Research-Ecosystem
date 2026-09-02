# RSRE GitHub Testing Build

This package is for controlled testing. Never commit `.env`, `.env.local`, access tokens, database passwords, SMTP passwords, or WhatsApp credentials.

## Local services

- Frontend: `http://localhost:3000`
- Django API: `http://localhost:8000`

## Key workflows to test

1. Registration → email verification → login → password reset.
2. Student/Author dashboard → manuscript submission → status tracking.
3. Editor dashboard → screening → reviewer assignment → decisions.
4. Reviewer dashboard → assignment → structured review → recommendation.
5. Editor-in-Chief dashboard → final editorial oversight and publication.
6. Research Academy → lessons → required assessments → module certificate → badge → next module/level unlock.
7. Research Passport → edit profile → choose visibility (`private`, `network`, `public`) → choose public fields → verify public spotlight.
8. Research Opportunities → manually added opportunities → external opportunities → deadlines → expired records disappear automatically.
9. Collaboration Network → registered request → detailed email/in-app/WhatsApp notification when configured → accept/decline.
10. Collaboration Network → invite a mentor/colleague by email when they are not yet registered.

## Notification behavior

Email is the primary reliable notification channel and has been tested separately. WhatsApp is optional and should remain disabled until the provider credentials are configured and a live test is completed.

## Opportunities

The public feed supports administrator-added opportunities and a best-effort Grants.gov refresh every six hours when a public opportunity feed is requested. Provider-specific integrations should be added as separate adapters rather than hard-coded into the UI.
