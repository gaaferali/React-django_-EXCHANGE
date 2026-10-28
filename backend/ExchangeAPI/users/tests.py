from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AuthenticationApiTests(APITestCase):
    def test_registration_hashes_password_and_returns_jwt_pair(self):
        response = self.client.post(
            reverse("register"),
            {
                "name": "Amina Hassan",
                "email": "AMINA@example.com",
                "password": "Strong-demo-pass-948!",
                "password_confirm": "Strong-demo-pass-948!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        user = User.objects.get(email="amina@example.com")
        self.assertTrue(user.check_password("Strong-demo-pass-948!"))
        self.assertNotEqual(user.password, "Strong-demo-pass-948!")

    def test_registration_rejects_duplicate_email_case_insensitively(self):
        User.objects.create_user("owner@example.com", "Strong-demo-pass-948!", name="Owner")
        response = self.client.post(
            reverse("register"),
            {
                "name": "Duplicate",
                "email": "OWNER@example.com",
                "password": "Strong-demo-pass-948!",
                "password_confirm": "Strong-demo-pass-948!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_refresh_profile_and_logout(self):
        user = User.objects.create_user("user@example.com", "Strong-demo-pass-948!", name="User")
        login = self.client.post(
            reverse("login"), {"email": user.email, "password": "Strong-demo-pass-948!"}, format="json"
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        refresh = self.client.post(reverse("token-refresh"), {"refresh": login.data["refresh"]}, format="json")
        self.assertEqual(refresh.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.data['access']}")
        profile = self.client.get(reverse("profile"))
        self.assertEqual(profile.status_code, status.HTTP_200_OK)
        self.assertEqual(profile.data["email"], user.email)
        logout = self.client.post(reverse("logout"), {"refresh": refresh.data["refresh"]}, format="json")
        self.assertEqual(logout.status_code, status.HTTP_204_NO_CONTENT)

    def test_banned_user_cannot_log_in(self):
        user = User.objects.create_user("blocked@example.com", "Strong-demo-pass-948!", name="Blocked")
        user.is_banned = True
        user.save(update_fields=("is_banned",))
        response = self.client.post(
            reverse("login"), {"email": user.email, "password": "Strong-demo-pass-948!"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_profile_requires_authentication(self):
        self.assertEqual(self.client.get(reverse("profile")).status_code, status.HTTP_401_UNAUTHORIZED)
