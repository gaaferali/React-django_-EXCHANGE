from django.db import models
from datetime import datetime
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.models import AbstractBaseUser
class User(AbstractBaseUser):
    username= None
    name = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_Banned = models.BooleanField(default=False)
    profile_image = models.ImageField(
        upload_to='profile_images/',
        null=True,
        blank=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDSE = []
    
    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.name

# Create your models here.
