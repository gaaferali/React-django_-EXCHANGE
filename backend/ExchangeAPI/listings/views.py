from django.db.models import Prefetch
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .filters import FurnitureItemFilter
from .models import Favorite, FurnitureItem, ListingImage
from .permissions import IsOwnerOrAdminOrReadOnly
from .serializers import FurnitureItemSerializer


class FurnitureItemViewSet(viewsets.ModelViewSet):
    serializer_class = FurnitureItemSerializer
    filterset_class = FurnitureItemFilter
    search_fields = ("title", "description", "location", "user__name")
    ordering_fields = ("created_at", "updated_at", "price", "title")
    ordering = ("-created_at",)
    permission_classes = (IsOwnerOrAdminOrReadOnly,)

    def get_queryset(self):
        queryset = FurnitureItem.objects.select_related("user").prefetch_related("images")
        if self.action == "list":
            return queryset.filter(status=FurnitureItem.Status.AVAILABLE, user__is_active=True)
        return queryset.exclude(status=FurnitureItem.Status.INACTIVE)

    def get_permissions(self):
        if self.action in {"create", "mine", "favorites", "favorite"}:
            return [IsAuthenticated()]
        if self.action in {"metadata", "list", "retrieve"}:
            return [AllowAny()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        listing = self.get_object()
        self.check_object_permissions(request, listing)
        listing.status = FurnitureItem.Status.INACTIVE
        listing.save(update_fields=("status", "updated_at"))
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=("get",))
    def mine(self, request):
        queryset = FurnitureItem.objects.filter(user=request.user).select_related("user").prefetch_related("images")
        page = self.paginate_queryset(queryset)
        return self.get_paginated_response(self.get_serializer(page, many=True).data)

    @action(detail=False, methods=("get",))
    def favorites(self, request):
        queryset = (
            FurnitureItem.objects.filter(favorited_by__user=request.user)
            .select_related("user")
            .prefetch_related("images")
        )
        page = self.paginate_queryset(queryset)
        return self.get_paginated_response(self.get_serializer(page, many=True).data)

    @action(detail=True, methods=("post", "delete"))
    def favorite(self, request, pk=None):
        listing = self.get_object()
        if request.method == "POST":
            Favorite.objects.get_or_create(user=request.user, listing=listing)
            return Response({"is_favorited": True}, status=status.HTTP_201_CREATED)
        Favorite.objects.filter(user=request.user, listing=listing).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=("get",), permission_classes=(AllowAny,))
    def metadata(self, _request):
        return Response(
            {
                "categories": [{"value": value, "label": label} for value, label in FurnitureItem.Category.choices],
                "conditions": [{"value": value, "label": label} for value, label in FurnitureItem.Condition.choices],
                "listing_types": [{"value": value, "label": label} for value, label in FurnitureItem.ListingType.choices],
            }
        )


class AdminListingViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = (IsAdminUser,)
    serializer_class = FurnitureItemSerializer
    queryset = FurnitureItem.objects.select_related("user").prefetch_related("images").all()
    search_fields = ("title", "description", "user__name", "user__email")
    filterset_fields = ("status", "category", "listing_type")

    @action(detail=True, methods=("post",))
    def moderate(self, request, pk=None):
        listing = self.get_object()
        listing.status = FurnitureItem.Status.INACTIVE
        listing.save(update_fields=("status", "updated_at"))
        return Response(self.get_serializer(listing).data)
