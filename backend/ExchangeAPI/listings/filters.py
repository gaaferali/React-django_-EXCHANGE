import django_filters

from .models import FurnitureItem


class FurnitureItemFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")

    class Meta:
        model = FurnitureItem
        fields = ("category", "condition", "listing_type", "status", "min_price", "max_price")
