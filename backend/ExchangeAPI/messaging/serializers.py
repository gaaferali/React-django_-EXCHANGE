from django.db.models import Q
from rest_framework import serializers

from listings.models import FurnitureItem
from listings.serializers import FurnitureItemSerializer
from transactions.models import TransactionRequest
from users.models import User
from users.serializers import PublicUserSerializer
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = PublicUserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ("id", "sender", "body", "created_at", "read_at")
        read_only_fields = ("id", "sender", "created_at", "read_at")


class ConversationSerializer(serializers.ModelSerializer):
    participant_one = PublicUserSerializer(read_only=True)
    participant_two = PublicUserSerializer(read_only=True)
    other_participant = serializers.SerializerMethodField()
    listing = FurnitureItemSerializer(read_only=True)
    transaction_request_id = serializers.IntegerField(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = (
            "id",
            "participant_one",
            "participant_two",
            "other_participant",
            "listing",
            "transaction_request_id",
            "last_message",
            "unread_count",
            "created_at",
            "updated_at",
        )

    def get_other_participant(self, conversation):
        user = self.context["request"].user
        return PublicUserSerializer(conversation.other_participant(user), context=self.context).data

    def get_last_message(self, conversation):
        message = conversation.messages.last()
        return MessageSerializer(message, context=self.context).data if message else None

    def get_unread_count(self, conversation):
        user = self.context["request"].user
        return conversation.messages.filter(read_at__isnull=True).exclude(sender=user).count()


class ConversationCreateSerializer(serializers.Serializer):
    recipient_id = serializers.PrimaryKeyRelatedField(source="recipient", queryset=User.objects.filter(is_active=True))
    listing_id = serializers.PrimaryKeyRelatedField(
        source="listing", queryset=FurnitureItem.objects.all(), required=False, allow_null=True
    )
    request_id = serializers.PrimaryKeyRelatedField(
        source="transaction_request", queryset=TransactionRequest.objects.all(), required=False, allow_null=True
    )

    def validate(self, attrs):
        user = self.context["request"].user
        recipient = attrs["recipient"]
        listing = attrs.get("listing")
        transaction_request = attrs.get("transaction_request")
        if recipient == user:
            raise serializers.ValidationError({"recipient_id": "You cannot message yourself."})
        if listing and listing.user_id not in {user.id, recipient.id}:
            raise serializers.ValidationError({"listing_id": "One participant must own the listing."})
        if transaction_request:
            participant_ids = {transaction_request.requester_id, transaction_request.listing.user_id}
            if participant_ids != {user.id, recipient.id}:
                raise serializers.ValidationError({"request_id": "The users do not match this request."})
        return attrs

    def create(self, validated_data):
        return Conversation.objects.for_users(
            self.context["request"].user,
            validated_data["recipient"],
            listing=validated_data.get("listing"),
            transaction_request=validated_data.get("transaction_request"),
        )
