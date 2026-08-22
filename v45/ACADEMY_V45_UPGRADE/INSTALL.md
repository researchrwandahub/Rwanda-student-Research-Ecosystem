# V45 targeted Academy fix

1. Extract this folder into your RSRE project.
2. From `backend`, run:

```powershell
powershell.exe -ExecutionPolicy Bypass -File ".\ACADEMY_V45_UPGRADE\apply_academy_v45_patch.ps1"
& "C:\Users\user\.venv\Scripts\python.exe" manage.py check
```

3. Copy `frontend/pages/research-academy/module/[id].tsx` over your active frontend page at:
`frontend/frontend/pages/research-academy/module/[id].tsx`

4. Rebuild:

```powershell
cd ..\frontend\frontend
npm run build
```

No migration is required.
