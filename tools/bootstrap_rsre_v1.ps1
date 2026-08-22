param([switch]$UseSqlite)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$backend = Join-Path $root 'backend'
if ($UseSqlite) { $env:USE_SQLITE = 'True' }
Push-Location $backend
python manage.py check
python manage.py migrate
python manage.py seed_rsre
python manage.py seed_academy
python manage.py check
Pop-Location
Write-Host 'RSRE V1 bootstrap completed.' -ForegroundColor Green
Write-Host 'Start backend: cd backend; python manage.py runserver' -ForegroundColor Cyan
Write-Host 'Start frontend: cd frontend; npm install; npm run dev' -ForegroundColor Cyan
