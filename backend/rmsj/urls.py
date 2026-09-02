from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def health_check(request):
    return JsonResponse({"status": "ok", "service": "rsre-backend"})


urlpatterns = [
    path("api/payments/", include("rsre_payments.urls")),

    path("health/", health_check),
    path("admin/", admin.site.urls),
    path("api/", include("journal.urls")),
    path("api/academy/", include("academy.urls")),
    path("api/rsre/", include("rsre_core.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
