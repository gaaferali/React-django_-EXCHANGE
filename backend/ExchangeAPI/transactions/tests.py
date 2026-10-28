from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from common.test_utils import image_file
from listings.models import FurnitureItem
from users.models import User
from .models import TransactionRequest


class TransactionWorkflowTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user("owner@example.com", "Strong-demo-pass-948!", name="Owner")
        self.requester = User.objects.create_user("requester@example.com", "Strong-demo-pass-948!", name="Requester")
        self.third = User.objects.create_user("third@example.com", "Strong-demo-pass-948!", name="Third")
        self.target = self.item(self.owner, "Walnut desk")
        self.offer = self.item(self.requester, "Bookcase")

    def item(self, owner, title):
        return FurnitureItem.objects.create(
            user=owner,
            title=title,
            description="A well maintained furniture item for marketplace testing.",
            price="150.00",
            condition="good",
            category="desk",
            listing_type="both",
            cover_image=image_file(f"{title}.png"),
        )

    def test_exchange_acceptance_updates_both_items_and_rejects_competing_request(self):
        competing = TransactionRequest.objects.create(
            requester=self.third,
            listing=self.target,
            offered_item=self.item(self.third, "Side table"),
            request_type="exchange",
        )
        self.client.force_authenticate(self.requester)
        created = self.client.post(
            reverse("transaction-requests-list"),
            {"listing_id": self.target.id, "offered_item_id": self.offer.id, "request_type": "exchange"},
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED, created.data)
        self.client.force_authenticate(self.owner)
        accepted = self.client.post(reverse("transaction-requests-accept", args=(created.data["id"],)))
        self.assertEqual(accepted.status_code, status.HTTP_200_OK, accepted.data)
        self.target.refresh_from_db()
        self.offer.refresh_from_db()
        competing.refresh_from_db()
        self.assertEqual(self.target.status, FurnitureItem.Status.EXCHANGED)
        self.assertEqual(self.offer.status, FurnitureItem.Status.EXCHANGED)
        self.assertEqual(competing.status, TransactionRequest.Status.REJECTED)

    def test_requester_cannot_accept_own_request(self):
        request_obj = TransactionRequest.objects.create(
            requester=self.requester,
            listing=self.target,
            offered_amount=self.target.price,
            request_type="purchase",
        )
        self.client.force_authenticate(self.requester)
        response = self.client.post(reverse("transaction-requests-accept", args=(request_obj.id,)))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_frontend_cannot_supply_requester_or_price(self):
        self.client.force_authenticate(self.requester)
        response = self.client.post(
            reverse("transaction-requests-list"),
            {
                "listing_id": self.target.id,
                "request_type": "purchase",
                "offered_amount": "1.00",
                "requester": self.third.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        request_obj = TransactionRequest.objects.get(pk=response.data["id"])
        self.assertEqual(request_obj.requester, self.requester)
        self.assertEqual(request_obj.offered_amount, Decimal("150.00"))

    def test_requester_can_cancel_pending_request(self):
        request_obj = TransactionRequest.objects.create(
            requester=self.requester, listing=self.target, request_type="purchase", offered_amount=self.target.price
        )
        self.client.force_authenticate(self.requester)
        response = self.client.post(reverse("transaction-requests-cancel", args=(request_obj.id,)))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        request_obj.refresh_from_db()
        self.assertEqual(request_obj.status, TransactionRequest.Status.CANCELLED)
