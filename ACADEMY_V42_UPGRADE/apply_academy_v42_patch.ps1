param()
$ErrorActionPreference = 'Stop'
$backendRoot = Split-Path -Parent $PSScriptRoot
$academyRoot = Join-Path $backendRoot 'academy'
if (-not (Test-Path (Join-Path $academyRoot 'models.py'))) { throw "Could not find backend\academy at $academyRoot" }

Copy-Item (Join-Path $PSScriptRoot 'backend_patch\academy\downloads.py') (Join-Path $academyRoot 'downloads.py') -Force
New-Item -ItemType Directory -Force (Join-Path $academyRoot 'management\commands') | Out-Null
Copy-Item (Join-Path $PSScriptRoot 'backend_patch\academy\management\commands\seed_academy_module_badges.py') (Join-Path $academyRoot 'management\commands\seed_academy_module_badges.py') -Force

$viewPath = Join-Path $academyRoot 'views.py'
$views = Get-Content $viewPath -Raw
if ($views -notmatch 'from \.downloads import ModulePackDownloadView, CertificateDownloadView') {
  $views = $views -replace '(from \.services import notify_academy, issue_module_certificate, issue_level_certificate, issue_pathway_certificate, record_learning_event, sync_course_enrollment\r?\n)', '$1from .downloads import ModulePackDownloadView, CertificateDownloadView`r`n'
}
if ($views -notmatch "'badge__trigger_value'") {
  $views = $views.Replace(".values('badge__name','badge__code','badge__icon','awarded_at','evidence')", ".values('badge__name','badge__code','badge__icon','badge__trigger_value','awarded_at','evidence')")
}
# Extend AcademyAdminEnhancementsView with GET/PATCH immediately before its existing POST.
if ($views -match 'class AcademyAdminEnhancementsView') -and ($views -notmatch 'def patch\(self,request\):\r?\n        if not admin_required\(request\): return Response\(\{\x27detail\x27:\x27Academy administrator access required\.\x27\},status=403\)\r?\n        if request.data.get\(\x27kind\x27\)!=\x27badge\x27') {
  $anchor = 'class AcademyAdminEnhancementsView(APIView):\r?\n    permission_classes=\[IsAuthenticated\]\r?\n    def post(self,request):'
  $replacement = @'
class AcademyAdminEnhancementsView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        if not admin_required(request): return Response({'detail':'Academy administrator access required.'},status=403)
        return Response({'badges':list(Badge.objects.all().values('id','name','code','description','icon','trigger_type','trigger_value','active'))})
    def patch(self,request):
        if not admin_required(request): return Response({'detail':'Academy administrator access required.'},status=403)
        if request.data.get('kind')!='badge': return Response({'detail':'Unsupported enhancement type.'},status=400)
        obj=get_object_or_404(Badge,pk=request.data.get('id'))
        for f in ('name','code','description','icon','trigger_type','trigger_value','active'):
            if f in request.data: setattr(obj,f,request.data[f])
        obj.save()
        return Response({'id':obj.id,'name':obj.name,'code':obj.code,'description':obj.description,'icon':obj.icon,'trigger_type':obj.trigger_type,'trigger_value':obj.trigger_value,'active':obj.active})
    def post(self,request):
'@
  $views = [regex]::Replace($views,$anchor,$replacement,1)
}
Set-Content $viewPath $views -Encoding utf8

$urlPath = Join-Path $academyRoot 'urls.py'
$urls = Get-Content $urlPath -Raw
if ($urls -notmatch 'from \.downloads import ModulePackDownloadView, CertificateDownloadView') {
  $urls = "from .downloads import ModulePackDownloadView, CertificateDownloadView`r`n" + $urls
}
if ($urls -notmatch 'modules/<int:pk>/download/') {
  $urls = $urls.Replace('    path("modules/<int:pk>/", ModuleDetailView.as_view(), name="academy-module"),', '    path("modules/<int:pk>/", ModuleDetailView.as_view(), name="academy-module"),`r`n    path("modules/<int:pk>/download/", ModulePackDownloadView.as_view(), name="academy-module-download"),')
}
if ($urls -notmatch 'certificates/<str:certificate_id>/download/') {
  $urls = $urls.Replace('    path("certificates/verify/<str:certificate_id>/", CertificateVerifyView.as_view(), name="academy-certificate-verify"),', '    path("certificates/verify/<str:certificate_id>/", CertificateVerifyView.as_view(), name="academy-certificate-verify"),`r`n    path("certificates/<str:certificate_id>/download/", CertificateDownloadView.as_view(), name="academy-certificate-download"),')
}
Set-Content $urlPath $urls -Encoding utf8
Write-Host 'Academy V42 backend patch installed.' -ForegroundColor Green
Write-Host 'Next: install reportlab if missing, run manage.py check, then seed_academy_module_badges.' -ForegroundColor Yellow
