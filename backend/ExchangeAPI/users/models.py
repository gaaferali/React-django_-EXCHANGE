from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from common.validators import validate_image_upload
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    profile_image = models.ImageField(
        upload_to="profile_images/%Y/%m/",
        null=True,
        blank=True,
        validators=[validate_image_upload],
    )
    bio = models.CharField(max_length=500, blank=True)
    location = models.CharField(max_length=120, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        ordering = ("-created_at",)

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name or self.email
