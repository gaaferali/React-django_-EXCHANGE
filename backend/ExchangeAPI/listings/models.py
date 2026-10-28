from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q

from common.validators import validate_image_upload


class FurnitureItem(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        RESERVED = "reserved", "Reserved"
        SOLD = "sold", "Sold"
        EXCHANGED = "exchanged", "Exchanged"
        INACTIVE = "inactive", "Inactive"

    class Condition(models.TextChoices):
        LIKE_NEW = "like_new", "Like new"
        VERY_GOOD = "very_good", "Very good"
        GOOD = "good", "Good"
        FAIR = "fair", "Fair"

    class Category(models.TextChoices):
        SOFA = "sofa", "Sofas"
        CHAIR = "chair", "Chairs"
        TABLE = "table", "Tables"
        BED = "bed", "Beds"
        STORAGE = "storage", "Storage"
        DESK = "desk", "Desks"
        LIGHTING = "lighting", "Lighting"
        DECOR = "decor", "Decor"
        OTHER = "other", "Other"

    class ListingType(models.TextChoices):
        SALE = "sale", "For sale"
        EXCHANGE = "exchange", "For exchange"
        BOTH = "both", "Sale or exchange"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="furniture_items")
    title = models.CharField(max_length=160)
    description = models.TextField(max_length=3000)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    cover_image = models.ImageField(
        upload_to="furniture_images/%Y/%m/",
        blank=True,
        null=True,
        validators=[validate_image_upload],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    condition = models.CharField(max_length=20, choices=Condition.choices, default=Condition.GOOD)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    listing_type = models.CharField(max_length=20, choices=ListingType.choices, default=ListingType.SALE)
    location = models.CharField(max_length=120, blank=True)
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("status", "-created_at"), name="listing_status_created_idx"),
            models.Index(fields=("category", "condition"), name="listing_category_cond_idx"),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(price__gte=0), name="listing_price_nonnegative"),
        ]

    def clean(self):
        if self.listing_type in {self.ListingType.SALE, self.ListingType.BOTH} and self.price <= 0:
            raise ValidationError({"price": "Sale listings require a price greater than zero."})

    def __str__(self) -> str:
        return self.title


class ListingImage(models.Model):
    listing = models.ForeignKey(FurnitureItem, on_delete=models.CASCADE, related_name="images")
    file = models.ImageField(upload_to="furniture_images/%Y/%m/", validators=[validate_image_upload])
    position = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("position", "id")


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites")
    listing = models.ForeignKey(FurnitureItem, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(fields=("user", "listing"), name="unique_user_listing_favorite")
        ]
