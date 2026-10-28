import os

from django.core.management.base import BaseCommand, CommandError

from listings.models import FurnitureItem
from users.models import User


class Command(BaseCommand):
    help = "Create idempotent local demo users and furniture listings (no production images)."

    def handle(self, *args, **options):
        password = os.getenv("DEMO_PASSWORD")
        if not password:
            raise CommandError("Set DEMO_PASSWORD before running seed_demo.")

        accounts = [
            ("amina.demo@example.com", "Amina Hassan", "Khartoum"),
            ("samir.demo@example.com", "Samir Osman", "Omdurman"),
        ]
        users = {}
        for email, name, location in accounts:
            user, created = User.objects.get_or_create(email=email, defaults={"name": name, "location": location})
            if created:
                user.set_password(password)
                user.save(update_fields=("password",))
            users[email] = user

        samples = [
            {
                "user": users[accounts[0][0]],
                "title": "Solid oak dining table",
                "description": "Six-seat oak dining table with a sturdy frame and light surface wear. Collection required.",
                "price": "280.00",
                "category": "table",
                "condition": "good",
                "listing_type": "both",
                "location": accounts[0][2],
            },
            {
                "user": users[accounts[1][0]],
                "title": "Compact reading chair",
                "description": "Comfortable fabric reading chair in very good condition, suitable for a bedroom or study.",
                "price": "95.00",
                "category": "chair",
                "condition": "very_good",
                "listing_type": "sale",
                "location": accounts[1][2],
            },
        ]
        for sample in samples:
            FurnitureItem.objects.update_or_create(
                user=sample["user"], title=sample["title"], defaults=sample
            )
        self.stdout.write(self.style.SUCCESS("Demo accounts and listings are ready."))
