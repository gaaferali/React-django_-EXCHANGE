from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Conversation
from .serializers import ConversationCreateSerializer, ConversationSerializer, MessageSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = ConversationSerializer
    http_method_names = ("get", "post", "head", "options")

    def get_queryset(self):
        user = self.request.user
        return (
            Conversation.objects.filter(Q(participant_one=user) | Q(participant_two=user))
            .select_related("participant_one", "participant_two", "listing__user", "transaction_request")
            .prefetch_related("messages__sender", "listing__images")
            .distinct()
        )

    def create(self, request, *args, **kwargs):
        input_serializer = ConversationCreateSerializer(data=request.data, context={"request": request})
        input_serializer.is_valid(raise_exception=True)
        conversation = input_serializer.save()
        return Response(
            ConversationSerializer(conversation, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=("get", "post"))
    def messages(self, request, pk=None):
        conversation = self.get_object()
        if request.method == "POST":
            serializer = MessageSerializer(data=request.data, context={"request": request})
            serializer.is_valid(raise_exception=True)
            message = serializer.save(conversation=conversation, sender=request.user)
            conversation.save(update_fields=("updated_at",))
            return Response(MessageSerializer(message, context={"request": request}).data, status=201)
        messages = conversation.messages.select_related("sender")
        page = self.paginate_queryset(messages)
        return self.get_paginated_response(MessageSerializer(page, many=True, context={"request": request}).data)

    @action(detail=True, methods=("post",))
    def read(self, request, pk=None):
        conversation = self.get_object()
        updated = conversation.messages.filter(read_at__isnull=True).exclude(sender=request.user).update(read_at=timezone.now())
        return Response({"marked_read": updated})
