param()
$ErrorActionPreference='Stop'
$backendRoot=(Get-Location).Path
if(-not (Test-Path (Join-Path $backendRoot 'rmsj\settings.py'))){throw 'Run from RSRE\backend.'}
$src=Join-Path $PSScriptRoot 'backend_patch\rsre_payments'
$app=Join-Path $backendRoot 'rsre_payments'
if(Test-Path $app){Copy-Item $app "$app.v43-backup" -Recurse -Force}
New-Item -ItemType Directory -Force $app | Out-Null
Copy-Item "$src\*" $app -Recurse -Force

$settings=Join-Path $backendRoot 'rmsj\settings.py'; $s=Get-Content $settings -Raw
if($s -notmatch '"rsre_payments"'){
  $s=$s.Replace('    "rsre_core",','    "rsre_core",`r`n    "rsre_payments",')
}
Set-Content $settings $s -Encoding utf8

$urls=Join-Path $backendRoot 'rmsj\urls.py'; $u=Get-Content $urls -Raw
if($u -notmatch 'rsre_payments.urls'){
  $insert='    path("api/payments/", include("rsre_payments.urls")),`r`n'
  $u=$u.Replace('urlpatterns = [', 'urlpatterns = [`r`n'+$insert)
}
Set-Content $urls $u -Encoding utf8
Write-Host 'RSRE V44 Support Payments backend installed.' -ForegroundColor Green
Write-Host 'Next: python manage.py makemigrations rsre_payments; python manage.py migrate; python manage.py check' -ForegroundColor Yellow
