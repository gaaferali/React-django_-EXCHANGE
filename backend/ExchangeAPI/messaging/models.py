from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class ConversationManager(models.Manager):
    def for_users(self, first_user, second_user, *, listing=None, transaction_request=None):
        if first_user.id == second_user.id:
            raise ValidationError("A conversation requires two different users.")
        participant_one, participant_two = sorted((first_user, second_user), key=lambda user: user.id)
        if transaction_request:
            context_key = f"request:{transaction_request.id}"
        elif listing:
            context_key = f"listing:{listing.id}"
        else:
            context_key = "general"
        conversation, _ = self.get_or_create(
            participant_one=participant_one,
            participant_two=participant_two,
            context_key=context_key,
            defaults={"listing": listing, "transaction_request": transaction_request},
        )
        return conversation


class Conversation(models.Model):
    participant_one = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="conversations_as_first"
    )
    participant_two = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="conversations_as_second"
    )
    listing = models.ForeignKey(
        "listings.FurnitureItem", on_delete=models.SET_NULL, null=True, blank=True, related_name="conversations"
    )
    transaction_request = models.ForeignKey(
        "transactions.TransactionRequest",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="conversations",
    )
    context_key = models.CharField(max_length=64, default="general")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ConversationManager()

    class Meta:
        ordering = ("-updated_at",)
        constraints = [
            models.UniqueConstraint(
                fields=("participant_one", "participant_two", "context_key"),
                name="unique_conversation_context",
            ),
            models.CheckConstraint(
                condition=models.Q(participant_one__lt=models.F("participant_two")),
                name="ordered_conversation_participants",
            ),
        ]

    def includes(self, user) -> bool:
        return user.id in {self.participant_one_id, self.participant_two_id}

    def other_participant(self, user):
        return self.participant_two if self.participant_one_id == user.id else self.participant_one


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
    body = models.CharField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("created_at",)
        indexes = [models.Index(fields=("conversation", "created_at"), name="message_conversation_idx")]

    def clean(self):
        if self.conversation_id and self.sender_id and not self.conversation.includes(self.sender):
            raise ValidationError("The sender is not a conversation participant.")
