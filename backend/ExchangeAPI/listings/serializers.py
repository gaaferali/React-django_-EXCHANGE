from .models import FurnitureItem
from rest_framework import serializers

class FurnitureItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FurnitureItem
        fields = '__all__'
class CreateListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FurnitureItem
        fields = ['title',
                'description', 
                'price', 
                'image', 
                'category', 
                'condition', 
                'statues']