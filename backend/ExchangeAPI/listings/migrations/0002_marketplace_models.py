from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def normalize_existing_listings(apps, _schema_editor):
    FurnitureItem = apps.get_model("listings", "FurnitureItem")
    ListingImage = apps.get_model("listings", "ListingImage")
    status_map = {"new": "available", "available": "available", "sold": "sold", "exchanged": "exchanged"}
    condition_map = {
        "new": "like_new",
        "like new": "like_new",
        "excellent": "very_good",
        "used": "good",
        "fair": "fair",
    }
    category_map = {
        "sofa": "sofa",
        "chair": "chair",
        "bed": "bed",
        "table": "table",
        "cabinet": "storage",
        "shelf": "storage",
        "wardrobe": "storage",
        "desk": "desk",
    }
    for listing in FurnitureItem.objects.all().iterator():
        listing.status = status_map.get(str(listing.status).lower(), "available")
        listing.condition = condition_map.get(str(listing.condition).lower(), "good")
        listing.category = category_map.get(str(listing.category).lower(), "other")
        listing.save(update_fields=("status", "condition", "category"))
        if listing.cover_image:
            ListingImage.objects.get_or_create(
                listing_id=listing.id,
                file=listing.cover_image.name,
                defaults={"position": 0},
            )


class Migration(migrations.Migration):
    dependencies = [("users", "0006_professionalize_user"), ("listings", "0001_initial")]

    operations = [
        migrations.RenameField(model_name="furnitureitem", old_name="statues", new_name="status"),
        migrations.RenameField(model_name="furnitureitem", old_name="image", new_name="cover_image"),
        migrations.AlterField(model_name="furnitureitem", name="title", field=models.CharField(max_length=160)),
        migrations.AlterField(model_name="furnitureitem", name="description", field=models.TextField(max_length=3000)),
        migrations.AlterField(model_name="furnitureitem", name="price", field=models.DecimalField(decimal_places=2, default=0, max_digits=10)),
        migrations.AlterField(model_name="furnitureitem", name="cover_image", field=models.ImageField(blank=True, null=True, upload_to="furniture_images/%Y/%m/")),
        migrations.AlterField(model_name="furnitureitem", name="status", field=models.CharField(choices=[("available", "Available"), ("reserved", "Reserved"), ("sold", "Sold"), ("exchanged", "Exchanged"), ("inactive", "Inactive")], default="available", max_length=20)),
        migrations.AlterField(model_name="furnitureitem", name="condition", field=models.CharField(choices=[("like_new", "Like new"), ("very_good", "Very good"), ("good", "Good"), ("fair", "Fair")], default="good", max_length=20)),
        migrations.AlterField(model_name="furnitureitem", name="category", field=models.CharField(choices=[("sofa", "Sofas"), ("chair", "Chairs"), ("table", "Tables"), ("bed", "Beds"), ("storage", "Storage"), ("desk", "Desks"), ("lighting", "Lighting"), ("decor", "Decor"), ("other", "Other")], default="other", max_length=20)),
        migrations.AddField(model_name="furnitureitem", name="listing_type", field=models.CharField(choices=[("sale", "For sale"), ("exchange", "For exchange"), ("both", "Sale or exchange")], default="sale", max_length=20)),
        migrations.AddField(model_name="furnitureitem", name="location", field=models.CharField(blank=True, max_length=120)),
        migrations.AddField(model_name="furnitureitem", name="is_featured", field=models.BooleanField(default=False)),
        migrations.CreateModel(
            name="ListingImage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("file", models.ImageField(upload_to="furniture_images/%Y/%m/")),
                ("position", models.PositiveSmallIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("listing", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="images", to="listings.furnitureitem")),
            ],
            options={"ordering": ("position", "id")},
        ),
        migrations.CreateModel(
            name="Favorite",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("listing", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="favorited_by", to="listings.furnitureitem")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="favorites", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ("-created_at",)},
        ),
        migrations.RunPython(normalize_existing_listings, migrations.RunPython.noop),
        migrations.AddIndex(model_name="furnitureitem", index=models.Index(fields=["status", "-created_at"], name="listing_status_created_idx")),
        migrations.AddIndex(model_name="furnitureitem", index=models.Index(fields=["category", "condition"], name="listing_category_cond_idx")),
        migrations.AddConstraint(model_name="furnitureitem", constraint=models.CheckConstraint(condition=models.Q(("price__gte", 0)), name="listing_price_nonnegative")),
        migrations.AddConstraint(model_name="favorite", constraint=models.UniqueConstraint(fields=("user", "listing"), name="unique_user_listing_favorite")),
    ]
