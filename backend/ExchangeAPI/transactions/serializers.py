from django.db import IntegrityError
from rest_framework import serializers

from listings.models import FurnitureItem
from listings.serializers import FurnitureItemSerializer
from users.serializers import PublicUserSerializer
from .models import TransactionRequest


class TransactionRequestSerializer(serializers.ModelSerializer):
    requester = PublicUserSerializer(read_only=True)
    recipient = PublicUserSerializer(source="listing.user", read_only=True)
    listing = FurnitureItemSerializer(read_only=True)
    listing_id = serializers.PrimaryKeyRelatedField(
        source="listing", queryset=FurnitureItem.objects.all(), write_only=True
    )
    offered_item = FurnitureItemSerializer(read_only=True)
    offered_item_id = serializers.PrimaryKeyRelatedField(
        source="offered_item",
        queryset=FurnitureItem.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = TransactionRequest
        fields = (
            "id",
            "requester",
            "recipient",
            "listing",
            "listing_id",
            "offered_item",
            "offered_item_id",
            "request_type",
            "offered_amount",
            "message",
            "status",
            "created_at",
            "updated_at",
            "resolved_at",
        )
        read_only_fields = ("offered_amount", "status", "created_at", "updated_at", "resolved_at")

    def validate(self, attrs):
        user = self.context["request"].user
        listing = attrs["listing"]
        offered_item = attrs.get("offered_item")
        request_type = attrs["request_type"]
        if listing.user_id == user.id:
            raise serializers.ValidationError("You cannot request your own listing.")
        if listing.status != FurnitureItem.Status.AVAILABLE:
            raise serializers.ValidationError({"listing_id": "This listing is not available."})
        if request_type == TransactionRequest.RequestType.PURCHASE:
            if listing.listing_type not in {FurnitureItem.ListingType.SALE, FurnitureItem.ListingType.BOTH}:
                raise serializers.ValidationError({"request_type": "This listing is not offered for sale."})
            if offered_item:
                raise serializers.ValidationError({"offered_item_id": "Purchase requests cannot include an item."})
        else:
            if listing.listing_type not in {FurnitureItem.ListingType.EXCHANGE, FurnitureItem.ListingType.BOTH}:
                raise serializers.ValidationError({"request_type": "This listing is not offered for exchange."})
            if not offered_item:
                raise serializers.ValidationError({"offered_item_id": "Select one of your available items."})
            if offered_item.user_id != user.id:
                raise serializers.ValidationError({"offered_item_id": "You can only offer an item you own."})
            if offered_item.status != FurnitureItem.Status.AVAILABLE:
                raise serializers.ValidationError({"offered_item_id": "The offered item is not available."})
            if offered_item.listing_type not in {FurnitureItem.ListingType.EXCHANGE, FurnitureItem.ListingType.BOTH}:
                raise serializers.ValidationError({"offered_item_id": "The offered item is not exchange-enabled."})
        return attrs

    def create(self, validated_data):
        listing = validated_data["listing"]
        if validated_data["request_type"] == TransactionRequest.RequestType.PURCHASE:
            validated_data["offered_amount"] = listing.price
        try:
            return TransactionRequest.objects.create(requester=self.context["request"].user, **validated_data)
        except IntegrityError as exc:
            raise serializers.ValidationError("You already have a pending request of this type.") from exc
