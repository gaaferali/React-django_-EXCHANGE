from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class MarketplaceUserAdmin(UserAdmin):
    ordering = ("email",)
    list_display = ("email", "name", "is_active", "is_staff", "is_banned", "created_at")
    list_filter = ("is_active", "is_staff", "is_banned")
    search_fields = ("email", "name")
    readonly_fields = ("last_login", "created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile", {"fields": ("name", "profile_image", "bio", "location")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "is_banned", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "name", "password1", "password2", "is_staff")}),
    )
    filter_horizontal = ("groups", "user_permissions")
