from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdminListingViewSet, FurnitureItemViewSet

router = DefaultRouter()
router.register("listings", FurnitureItemViewSet, basename="listings")
router.register("admin/listings", AdminListingViewSet, basename="admin-listings")

urlpatterns = [path("", include(router.urls))]
