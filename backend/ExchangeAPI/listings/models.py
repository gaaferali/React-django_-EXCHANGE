from django.db import models
from users.models import User
class FurnitureItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='furniture_items')
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='furniture_images/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    statues = models.CharField(max_length=50, default='available')  # available, sold, exchanged
    condition = models.CharField(max_length=50, default='new')  #  Used, Like New, Excellent
    category = models.CharField(max_length=100, default='general')  #  Sofa, Chair, Bed,

    def __str__(self):
        return self.title

# Create your models here.
