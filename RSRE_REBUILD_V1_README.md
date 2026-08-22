# RSRE Rebuild V1 — Architecture Foundation

This package is a new RSRE parent-ecosystem foundation built from the V26 project baseline.

## Architecture

- RSRE is the parent ecosystem.
- One RSRE account/identity is shared across applications.
- Each pillar gets its own navigation, experience and dashboard.
- RSJH remains the journal/publishing application.
- Research Academy is a separate learning application with its own dashboard.
- Research Discovery and Research Analytics are first-class RSRE applications.
- Research Incubator, Research Opportunities, Research Passport, Research Sandbox, MedTech AI, Ethics & Compliance and Collaboration are first-class application routes.
- One RSRE Control Center provides central administration.
- Shared platform settings, support tickets, audit events and communication preferences live in `rsre_core`.
- Email and WhatsApp are modeled as shared communication channels; actual WhatsApp delivery is provider-configurable and disabled until configured.

## Safety / scope boundaries

The Research Sandbox is for public, synthetic and properly authorized data. RSRE does not replace statutory ethics committees, regulators, university research offices or clinical systems.

## Current status

This is V1 architecture + UI foundation, designed to replace the patch-on-patch Academy integration. Existing journal code and data remain in the baseline; the new RSRE shell is layered over it.

## Local setup

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:USE_SQLITE="True"
python manage.py migrate
python manage.py seed_rsre
python manage.py seed_academy
python manage.py check
python manage.py runserver
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000/`.

## Admin

For a staff/administrator account, open `/rsre-admin` for the RSRE Control Center. Django admin remains available at `/admin/` for low-level database administration and emergency operations; routine RSRE configuration should use the RSRE Control Center APIs/UI.


### RSRE V1.2 — Research Analytics upgrade
- Analytics dashboard connected to existing published-research APIs.
- Added publication trend, specialties, institutions and disease signals.
