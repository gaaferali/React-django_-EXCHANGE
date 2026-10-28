from django.db.models import Q
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import TransactionRequest
from .serializers import TransactionRequestSerializer
from .services import accept_request, resolve_request


class TransactionRequestViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = (IsAuthenticated,)
    serializer_class = TransactionRequestSerializer
    filterset_fields = ("status", "request_type")
    ordering_fields = ("created_at", "updated_at")

    def get_queryset(self):
        user = self.request.user
        return (
            TransactionRequest.objects.filter(Q(requester=user) | Q(listing__user=user))
            .select_related("requester", "listing__user", "offered_item__user")
            .prefetch_related("listing__images", "offered_item__images")
            .distinct()
        )

    @action(detail=True, methods=("post",))
    def accept(self, request, pk=None):
        request_obj = accept_request(int(pk), request.user)
        return Response(self.get_serializer(request_obj).data)

    @action(detail=True, methods=("post",))
    def reject(self, request, pk=None):
        request_obj = resolve_request(int(pk), request.user, TransactionRequest.Status.REJECTED)
        return Response(self.get_serializer(request_obj).data)

    @action(detail=True, methods=("post",))
    def cancel(self, request, pk=None):
        request_obj = resolve_request(int(pk), request.user, TransactionRequest.Status.CANCELLED)
        return Response(self.get_serializer(request_obj).data)
