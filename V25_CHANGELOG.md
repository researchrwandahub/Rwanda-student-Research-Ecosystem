# RSJH V25 — Research Ecosystem Upgrade

## Included
- Permanent public Archive with year / volume / issue presentation.
- Fixed Author Dashboard review feedback and editorial history by preserving request context in the `articles/my` serializer path.
- CRediT-style co-author contribution roles stored per manuscript and displayed on author/public article pages.
- Authenticated RSJH researcher directory for searching co-authors without exposing the full user database.
- Handling Editor workflow so each manuscript has a clear editorial owner.
- Reviewer recommendation endpoint with topic-fit, workload and conflict checks.
- Reviewer assignment protections for lead-author/co-author conflicts, same-institution conflicts, duplicate assignments and cross-editor interference.
- Global Research Discovery page connected to OpenAlex and Crossref scholarly metadata through the Django backend.
- Research Opportunities page keeps local/editor-admin publishing while adding official external source discovery and a Grants.gov search connector.
- Official opportunity source directory for WHO/TDR, Grants.gov, Wellcome, NIH and Rwanda NCST.
- Updated RSJH visual theme toward a more editorial, green/ink identity with less blue-heavy chrome.
- Simple project explanation and sponsor proposition documents included under `docs/`.

## Important deployment note
Run the new migration on the backend before using handling editors and co-author contribution roles:

```powershell
python manage.py migrate
```

The external discovery connectors are deliberately read-only. RSJH should ingest or curate external opportunities according to each source's terms and keep Administrator/manual insertion for Rwanda-specific opportunities.

## V12 — Academy Credentials & Momentum
- Added verifiable ModuleCertificate records alongside existing level/pathway certificates.
- Module certificates are issued automatically after all required module work passes.
- Added certificate verification support for module credentials.
- Academy certificate page now displays module, level, and specialist certificates.
- Academy momentum reminders can be scheduled with the user opt-in preference.
- Kept unified in-app/email/optional WhatsApp notification delivery through the shared RSRE dispatcher.
- Fixed an existing Academy admin import syntax error found during validation.
