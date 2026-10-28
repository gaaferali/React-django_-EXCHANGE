from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TransactionRequestViewSet

router = DefaultRouter()
router.register("requests", TransactionRequestViewSet, basename="transaction-requests")

urlpatterns = [path("", include(router.urls))]
