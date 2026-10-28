from django.contrib import admin

from .models import Favorite, FurnitureItem, ListingImage


class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 0


@admin.register(FurnitureItem)
class FurnitureItemAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "category", "listing_type", "status", "price", "created_at")
    list_filter = ("status", "category", "condition", "listing_type")
    search_fields = ("title", "description", "user__name", "user__email")
    readonly_fields = ("created_at", "updated_at")
    inlines = (ListingImageInline,)


admin.site.register(Favorite)
