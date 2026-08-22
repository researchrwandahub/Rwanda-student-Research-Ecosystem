$ErrorActionPreference = 'Stop'
$backendRoot = (Get-Location).Path
if (-not (Test-Path (Join-Path $backendRoot 'academy\views.py'))) { throw 'Run this script from the RSRE backend folder.' }
$patch = Join-Path $PSScriptRoot 'backend_patch\academy'
$academy = Join-Path $backendRoot 'academy'

Copy-Item (Join-Path $patch 'completion_v45.py') (Join-Path $academy 'completion_v45.py') -Force
Copy-Item (Join-Path $patch 'views_v45.py') (Join-Path $academy 'views_v45.py') -Force
Copy-Item (Join-Path $patch 'quiz_v45.py') (Join-Path $academy 'quiz_v45.py') -Force
Copy-Item (Join-Path $patch 'downloads_v45.py') (Join-Path $academy 'downloads_v45.py') -Force

@'
from .quiz_v45 import SubmitQuizViewV45
from .downloads_v45 import ModulePackDownloadViewV45, CertificateDownloadViewV45
from .views_v45 import AcademyModuleFinalizeViewV45, AcademyProgressionViewV45
'@ + (Get-Content (Join-Path $academy 'urls.py') -Raw) | Set-Content (Join-Path $academy 'urls.py') -Encoding utf8

# Rewrite only the four relevant endpoint lines. This avoids injecting PowerShell newline escapes into Python.
$p = Join-Path $academy 'urls.py'
$u = Get-Content $p -Raw
$u = $u -replace 'path\("quizzes/<int:pk>/submit/",\s*[^,]+\.as_view\(\),\s*name="academy-quiz-submit"\)', 'path("quizzes/<int:pk>/submit/", SubmitQuizViewV45.as_view(), name="academy-quiz-submit")'
$u = $u -replace 'path\("modules/<int:pk>/download/".*?\),\s*', ''
$u = $u -replace 'path\("certificates/<str:certificate_id>/download/".*?\),\s*', ''
$u = $u -replace 'path\("modules/<int:pk>/finalize/".*?\),\s*', ''
$u = $u -replace 'path\("progression/".*?\),\s*', ''
$anchor = 'path("modules/<int:pk>/", ModuleDetailView.as_view(), name="academy-module"),'
$insert = $anchor + "`r`n    path(" + '"modules/<int:pk>/finalize/", AcademyModuleFinalizeViewV45.as_view(), name="academy-module-finalize"),' + "`r`n    path(" + '"progression/", AcademyProgressionViewV45.as_view(), name="academy-progression"),' + "`r`n    path(" + '"modules/<int:pk>/download/", ModulePackDownloadViewV45.as_view(), name="academy-module-download"),'
$u = $u.Replace($anchor, $insert)
$certAnchor = 'path("certificates/verify/<str:certificate_id>/", CertificateVerifyView.as_view(), name="academy-certificate-verify"),'
$certInsert = $certAnchor + "`r`n    path(" + '"certificates/<str:certificate_id>/download/", CertificateDownloadViewV45.as_view(), name="academy-certificate-download"),'
$u = $u.Replace($certAnchor, $certInsert)
Set-Content $p $u -Encoding utf8

Write-Host 'Academy V45 completion/unlock/certificate patch installed.' -ForegroundColor Green
