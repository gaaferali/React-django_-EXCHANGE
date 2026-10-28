from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q

from listings.models import FurnitureItem


class TransactionRequest(models.Model):
    class RequestType(models.TextChoices):
        PURCHASE = "purchase", "Purchase"
        EXCHANGE = "exchange", "Exchange"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_transaction_requests"
    )
    listing = models.ForeignKey(
        FurnitureItem, on_delete=models.PROTECT, related_name="transaction_requests"
    )
    offered_item = models.ForeignKey(
        FurnitureItem,
        on_delete=models.PROTECT,
        related_name="exchange_offers",
        null=True,
        blank=True,
    )
    request_type = models.CharField(max_length=20, choices=RequestType.choices)
    offered_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    message = models.CharField(max_length=1000, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("listing", "status"), name="request_listing_status_idx"),
            models.Index(fields=("requester", "status"), name="request_sender_status_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=("requester", "listing", "request_type"),
                condition=Q(status="pending"),
                name="unique_pending_request",
            ),
            models.CheckConstraint(
                condition=(
                    Q(request_type="purchase", offered_item__isnull=True)
                    | Q(request_type="exchange", offered_item__isnull=False)
                ),
                name="request_type_matches_offer",
            ),
        ]

    @property
    def recipient(self):
        return self.listing.user

    def clean(self):
        if self.requester_id and self.listing_id and self.requester_id == self.listing.user_id:
            raise ValidationError("You cannot send a request for your own listing.")

    def __str__(self) -> str:
        return f"{self.get_request_type_display()} request for {self.listing}"
