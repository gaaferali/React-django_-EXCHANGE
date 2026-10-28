from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(_request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health-check"),
    path("api/auth/", include("users.urls")),
    path("api/", include("users.admin_urls")),
    path("api/", include("listings.urls")),
    path("api/", include("transactions.urls")),
    path("api/", include("messaging.urls")),
    # Backward-compatible aliases for the original student frontend.
    path("", include("users.legacy_urls")),
    path("listings/", include("listings.legacy_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
