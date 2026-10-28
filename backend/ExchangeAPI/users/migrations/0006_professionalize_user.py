import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
        ("users", "0005_user_last_login"),
    ]

    operations = [
        migrations.RenameField(model_name="user", old_name="is_Banned", new_name="is_banned"),
        migrations.AlterField(model_name="user", name="name", field=models.CharField(max_length=150)),
        migrations.AlterField(
            model_name="user",
            name="profile_image",
            field=models.ImageField(blank=True, null=True, upload_to="profile_images/%Y/%m/"),
        ),
        migrations.AddField(model_name="user", name="bio", field=models.CharField(blank=True, max_length=500)),
        migrations.AddField(model_name="user", name="location", field=models.CharField(blank=True, max_length=120)),
        migrations.AddField(model_name="user", name="is_staff", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="user", name="is_superuser", field=models.BooleanField(default=False)),
        migrations.AddField(
            model_name="user",
            name="groups",
            field=models.ManyToManyField(blank=True, help_text="Groups this user belongs to.", related_name="user_set", related_query_name="user", to="auth.group", verbose_name="groups"),
        ),
        migrations.AddField(
            model_name="user",
            name="user_permissions",
            field=models.ManyToManyField(blank=True, help_text="Specific permissions for this user.", related_name="user_set", related_query_name="user", to="auth.permission", verbose_name="user permissions"),
        ),
        migrations.AlterModelOptions(name="user", options={"ordering": ("-created_at",)}),
    ]
