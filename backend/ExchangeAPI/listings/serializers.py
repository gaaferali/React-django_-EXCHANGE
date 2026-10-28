from django.db import transaction
from rest_framework import serializers

from users.serializers import PublicUserSerializer
from .models import Favorite, FurnitureItem, ListingImage


class ListingImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ListingImage
        fields = ("id", "url", "position")

    def get_url(self, image):
        request = self.context.get("request")
        return request.build_absolute_uri(image.file.url) if request else image.file.url


class FurnitureItemSerializer(serializers.ModelSerializer):
    owner = PublicUserSerializer(source="user", read_only=True)
    images = ListingImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False, max_length=8
    )
    cover_image_url = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    condition_display = serializers.CharField(source="get_condition_display", read_only=True)
    listing_type_display = serializers.CharField(source="get_listing_type_display", read_only=True)
    itemID = serializers.IntegerField(source="id", read_only=True)
    userID = serializers.IntegerField(source="user_id", read_only=True)
    imagePath = serializers.SerializerMethodField()
    statues = serializers.CharField(source="status", read_only=True)

    class Meta:
        model = FurnitureItem
        fields = (
            "id",
            "itemID",
            "userID",
            "owner",
            "title",
            "description",
            "price",
            "cover_image",
            "cover_image_url",
            "imagePath",
            "images",
            "uploaded_images",
            "status",
            "statues",
            "condition",
            "condition_display",
            "category",
            "category_display",
            "listing_type",
            "listing_type_display",
            "location",
            "is_featured",
            "is_favorited",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("status", "is_featured", "created_at", "updated_at")
        extra_kwargs = {"cover_image": {"write_only": True, "required": False}}

    def get_cover_image_url(self, listing):
        if not listing.cover_image:
            first_image = listing.images.first()
            if not first_image:
                return None
            url = first_image.file.url
        else:
            url = listing.cover_image.url
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request else url

    def get_imagePath(self, listing):
        return self.get_cover_image_url(listing)

    def get_is_favorited(self, listing):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        prefetched = getattr(listing, "_favorite_user_ids", None)
        if prefetched is not None:
            return request.user.id in prefetched
        return Favorite.objects.filter(user=request.user, listing=listing).exists()

    def validate(self, attrs):
        listing_type = attrs.get("listing_type", getattr(self.instance, "listing_type", None))
        price = attrs.get("price", getattr(self.instance, "price", 0))
        if listing_type in {FurnitureItem.ListingType.SALE, FurnitureItem.ListingType.BOTH} and price <= 0:
            raise serializers.ValidationError({"price": "Sale listings require a positive price."})
        if not self.instance and not attrs.get("cover_image") and not attrs.get("uploaded_images"):
            raise serializers.ValidationError({"uploaded_images": "Add at least one listing image."})
        return attrs

    def _save_images(self, listing, images):
        start = listing.images.count()
        for index, image in enumerate(images):
            ListingImage.objects.create(listing=listing, file=image, position=start + index)

    @transaction.atomic
    def create(self, validated_data):
        images = validated_data.pop("uploaded_images", [])
        listing = super().create(validated_data)
        self._save_images(listing, images)
        return listing

    @transaction.atomic
    def update(self, instance, validated_data):
        images = validated_data.pop("uploaded_images", [])
        listing = super().update(instance, validated_data)
        self._save_images(listing, images)
        return listing
