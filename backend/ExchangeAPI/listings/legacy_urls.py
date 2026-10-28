from django.urls import path

from .views import FurnitureItemViewSet

list_view = FurnitureItemViewSet.as_view({"get": "list"})
detail_view = FurnitureItemViewSet.as_view({"get": "retrieve"})
create_view = FurnitureItemViewSet.as_view({"post": "create"})
update_view = FurnitureItemViewSet.as_view({"put": "update", "patch": "partial_update"})
delete_view = FurnitureItemViewSet.as_view({"delete": "destroy"})

urlpatterns = [
    path("", list_view),
    path("create/", create_view),
    path("<int:pk>/", detail_view),
    path("<int:pk>/update/", update_view),
    path("<int:pk>/delete/", delete_view),
]
