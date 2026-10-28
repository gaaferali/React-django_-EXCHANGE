from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("listings", "0002_marketplace_models"),
    ]
    operations = [
        migrations.CreateModel(
            name="TransactionRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("request_type", models.CharField(choices=[("purchase", "Purchase"), ("exchange", "Exchange")], max_length=20)),
                ("offered_amount", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("message", models.CharField(blank=True, max_length=1000)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("accepted", "Accepted"), ("rejected", "Rejected"), ("cancelled", "Cancelled")], default="pending", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("resolved_at", models.DateTimeField(blank=True, null=True)),
                ("listing", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="transaction_requests", to="listings.furnitureitem")),
                ("offered_item", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="exchange_offers", to="listings.furnitureitem")),
                ("requester", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sent_transaction_requests", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ("-created_at",)},
        ),
        migrations.AddIndex(model_name="transactionrequest", index=models.Index(fields=["listing", "status"], name="request_listing_status_idx")),
        migrations.AddIndex(model_name="transactionrequest", index=models.Index(fields=["requester", "status"], name="request_sender_status_idx")),
        migrations.AddConstraint(model_name="transactionrequest", constraint=models.UniqueConstraint(condition=models.Q(("status", "pending")), fields=("requester", "listing", "request_type"), name="unique_pending_request")),
        migrations.AddConstraint(model_name="transactionrequest", constraint=models.CheckConstraint(condition=models.Q(models.Q(("offered_item__isnull", True), ("request_type", "purchase")), models.Q(("offered_item__isnull", False), ("request_type", "exchange")), _connector="OR"), name="request_type_matches_offer")),
    ]
