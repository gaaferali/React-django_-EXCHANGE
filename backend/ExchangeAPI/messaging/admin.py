from django.contrib import admin

from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ("created_at", "read_at")


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "participant_one", "participant_two", "context_key", "updated_at")
    search_fields = ("participant_one__email", "participant_two__email")
    inlines = (MessageInline,)
