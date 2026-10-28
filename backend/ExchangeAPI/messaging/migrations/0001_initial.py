from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("listings", "0002_marketplace_models"),
        ("transactions", "0001_initial"),
    ]
    operations = [
        migrations.CreateModel(
            name="Conversation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("context_key", models.CharField(default="general", max_length=64)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("listing", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="conversations", to="listings.furnitureitem")),
                ("participant_one", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="conversations_as_first", to=settings.AUTH_USER_MODEL)),
                ("participant_two", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="conversations_as_second", to=settings.AUTH_USER_MODEL)),
                ("transaction_request", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="conversations", to="transactions.transactionrequest")),
            ],
            options={"ordering": ("-updated_at",)},
        ),
        migrations.CreateModel(
            name="Message",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("body", models.CharField(max_length=2000)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("read_at", models.DateTimeField(blank=True, null=True)),
                ("conversation", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="messages", to="messaging.conversation")),
                ("sender", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sent_messages", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ("created_at",)},
        ),
        migrations.AddConstraint(model_name="conversation", constraint=models.UniqueConstraint(fields=("participant_one", "participant_two", "context_key"), name="unique_conversation_context")),
        migrations.AddConstraint(model_name="conversation", constraint=models.CheckConstraint(condition=models.Q(("participant_one__lt", models.F("participant_two"))), name="ordered_conversation_participants")),
        migrations.AddIndex(model_name="message", index=models.Index(fields=["conversation", "created_at"], name="message_conversation_idx")),
    ]
