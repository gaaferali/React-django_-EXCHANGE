from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from common.test_utils import image_file
from users.models import User
from .models import Favorite, FurnitureItem, ListingImage


class ListingApiTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user("owner@example.com", "Strong-demo-pass-948!", name="Owner")
        self.other = User.objects.create_user("other@example.com", "Strong-demo-pass-948!", name="Other")

    def create_listing(self, owner=None, **overrides):
        values = {
            "user": owner or self.owner,
            "title": "Oak dining table",
            "description": "A solid dining table with light signs of use.",
            "price": "240.00",
            "condition": FurnitureItem.Condition.GOOD,
            "category": FurnitureItem.Category.TABLE,
            "listing_type": FurnitureItem.ListingType.BOTH,
            "cover_image": image_file(),
        }
        values.update(overrides)
        return FurnitureItem.objects.create(**values)

    def test_create_listing_assigns_authenticated_owner_and_images(self):
        self.client.force_authenticate(self.owner)
        response = self.client.post(
            reverse("listings-list"),
            {
                "title": "Reading chair",
                "description": "Comfortable upholstered chair in very good condition.",
                "price": "95.00",
                "condition": "very_good",
                "category": "chair",
                "listing_type": "sale",
                "cover_image": image_file(),
                "uploaded_images": [image_file("detail.png")],
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        listing = FurnitureItem.objects.get(pk=response.data["id"])
        self.assertEqual(listing.user, self.owner)
        self.assertEqual(ListingImage.objects.filter(listing=listing).count(), 1)

    def test_non_owner_cannot_update_or_delete_listing(self):
        listing = self.create_listing()
        self.client.force_authenticate(self.other)
        update = self.client.patch(reverse("listings-detail", args=(listing.id,)), {"title": "Hijacked"})
        delete = self.client.delete(reverse("listings-detail", args=(listing.id,)))
        self.assertEqual(update.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(delete.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_delete_is_soft_and_preserves_record(self):
        listing = self.create_listing()
        self.client.force_authenticate(self.owner)
        response = self.client.delete(reverse("listings-detail", args=(listing.id,)))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        listing.refresh_from_db()
        self.assertEqual(listing.status, FurnitureItem.Status.INACTIVE)

    def test_search_filter_sort_and_pagination(self):
        self.create_listing(title="Oak table", price="250.00", category="table")
        self.create_listing(title="Blue sofa", price="700.00", category="sofa")
        response = self.client.get(
            reverse("listings-list"),
            {"search": "Oak", "category": "table", "min_price": 200, "ordering": "price"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Oak table")

    def test_favorite_lifecycle(self):
        listing = self.create_listing()
        self.client.force_authenticate(self.other)
        url = reverse("listings-favorite", args=(listing.id,))
        self.assertEqual(self.client.post(url).status_code, status.HTTP_201_CREATED)
        self.assertTrue(Favorite.objects.filter(user=self.other, listing=listing).exists())
        favorites = self.client.get(reverse("listings-favorites"))
        self.assertEqual(favorites.data["count"], 1)
        self.assertEqual(self.client.delete(url).status_code, status.HTTP_204_NO_CONTENT)

    def test_invalid_image_is_rejected(self):
        self.client.force_authenticate(self.owner)
        response = self.client.post(
            reverse("listings-list"),
            {
                "title": "Invalid image item",
                "description": "This upload is intentionally not a real image.",
                "price": "25.00",
                "condition": "good",
                "category": "other",
                "listing_type": "sale",
                "cover_image": image_file("invalid.txt"),
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
