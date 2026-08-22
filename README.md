# RSRE Render deployment patch

This patch is for the existing RSRE repository. It does not replace the application.

Copy:
- `Dockerfile` -> repository root
- `backend/Dockerfile` -> `backend/Dockerfile`
- `render.yaml` -> repository root

Important:
- Root service = full RSRE Next.js application.
- Backend service = `backend/` Django application.
- Backend health check = `/health/`.
- Do NOT commit `backend/.env` or any real secrets.
- The free Render Postgres database is for testing and expires after 30 days.
