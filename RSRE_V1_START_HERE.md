# RSRE V1 — Start Here

This is the **new RSRE parent-ecosystem foundation** built from the existing V26 platform baseline. It is intentionally separate from the current working folder so the current platform is not destroyed during migration.

### What is preserved

- Existing RSJH journal models, editorial workflow, article routes and journal dashboards remain in the baseline.
- Existing RSJH user authentication is retained and extended with an editable WhatsApp number.
- Existing email infrastructure remains available.

### What is new

- RSRE parent website and global identity.
- Distinct application shells for Academy, Discovery, Analytics, Opportunities, Incubator, Passport, Sandbox, MedTech AI, Ethics/Compliance and Collaboration.
- Academy curriculum from the existing built Academy package, with real modules and progression.
- RSRE Control Center at `/rsre-admin`.
- Shared support tickets.
- Shared notification preferences and outbox.
- Email delivery service and provider-agnostic WhatsApp service.
- Application registry and editable platform settings.
- Audit event storage.

### First test

Use a **new copy/folder** of this rebuild. Do not run the bootstrap against the old working RSJH folder.

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
python manage.py createsuperuser
python manage.py check
python manage.py runserver
```

Frontend, in another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000/`.

### Key routes

- `/` — RSRE main website
- `/research-academy` — Research Academy
- `/research-academy/dashboard` — Academy dashboard
- `/research-academy/module/1` — first real module after login
- `/research-discovery` — Research Discovery (V1.1: OpenAlex + Crossref + RSJH unified search)
- `/research-analytics` — Research Analytics
- `/research-incubator` — Research Incubator
- `/research-opportunities` — Research Opportunities
- `/research-passport` — Research Passport
- `/research-sandbox` — Research Sandbox
- `/medtech-ai` — MedTech AI
- `/ethics-compliance` — Ethics & Compliance
- `/collaboration` — Collaboration Network
- `/articles` — RSJH Journal
- `/rsre-admin` — RSRE Control Center

### Migration strategy

Do **not** merge this into production yet. First validate the architecture, account login, Academy progression, admin workflows, notifications, and journal compatibility. Then migrate existing user/data records and application-by-application functionality deliberately.
