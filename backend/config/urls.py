from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/members/", include("members.urls")),
    path("api/ledger/", include("ledger.urls")),
    path("api/audit/", include("audit.urls")),
    path("api/contributions/", include("contributions.urls")),
    path("api/deposits/", include("deposits.urls")),
    path("api/withdrawals/", include("withdrawals.urls")),
    path("api/loans/", include("loans.urls")),
    path("api/guarantors/", include("guarantors.urls")),
    path("api/commodities/", include("commodities.urls")),
    path("api/reports/", include("reports.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
