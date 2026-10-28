from django.contrib import admin

from .models import TransactionRequest


@admin.register(TransactionRequest)
class TransactionRequestAdmin(admin.ModelAdmin):
    list_display = ("request_type", "listing", "requester", "status", "created_at")
    list_filter = ("request_type", "status")
    search_fields = ("listing__title", "requester__name", "requester__email")
    readonly_fields = ("created_at", "updated_at", "resolved_at")
