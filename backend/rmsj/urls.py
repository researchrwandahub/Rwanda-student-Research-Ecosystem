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

# Serving media through Django is fine for local development and gated
# behind DEBUG in the Django default template — but that meant that if
# DEBUG was ever False locally (the same misconfiguration that previously
# broke login via forced HTTPS redirects), uploaded images like founder
# photos and partner logos would silently 404 while the surrounding JSON
# data loaded fine — exactly the "names/bios show, images invisible"
# symptom. Checking DJANGO_ENV too means local media serving no longer
# silently depends on remembering to also set DEBUG=True. Production
# should still serve media via a real web server/object storage, so this
# stays off whenever DJANGO_ENV=production is explicitly set.
if settings.DEBUG or settings.DJANGO_ENV != "production":
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
