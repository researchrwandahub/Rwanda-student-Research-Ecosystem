# RSRE Research Opportunities Pillar — V1.3

## Product rule
Research Opportunities is a **feed**, not a directory of websites.

Students see active opportunities as structured cards with:
- opportunity title
- category
- concise description
- deadline
- days remaining
- status badge showing whether it was imported automatically or published by an administrator
- an **Open opportunity** action that redirects to the official application page without exposing the raw provider URL in the RSRE interface

## Two publication paths

### Automatic feed
The backend includes a management command:

```bash
python manage.py sync_opportunities
```

The first automatic connector uses the public Grants.gov `search2` API, which does not require authentication. The sync queries health/research-related keywords, imports posted/forecasted opportunities, deduplicates by provider record ID, updates existing records and keeps provider URLs internal to the backend.

Run the command on a scheduler in production (for example every 6–12 hours). This keeps the opportunity feed current without manual data entry.

### Admin-published feed
Administrators can add Rwanda-specific, university, NGO, partner and other approved opportunities from Django Admin. API creation/update/delete for opportunities is administrator-only.

Manual records are tagged internally as `manual`; automatic records are tagged `automatic`.

## Data lifecycle

- Expired opportunities are automatically excluded from the public API.
- Automatic records are updated on subsequent syncs rather than duplicated.
- Admin records remain available until an administrator deactivates or removes them.
- Provider URLs are retained internally so the **Open opportunity** action can redirect users to the official call/application page.

## Source verification
The automatic connector is based on the current Grants.gov Applicant API search2 service, which is documented as an unauthenticated public search endpoint. See the official Grants.gov API documentation for current API behavior. 
