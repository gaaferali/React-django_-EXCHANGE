from django.contrib.auth import authenticate, password_validation
from django.db.models.functions import Lower
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class PublicUserSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "name", "profile_image_url", "location")

    def get_profile_image_url(self, user):
        if not user.profile_image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(user.profile_image.url) if request else user.profile_image.url


class UserSerializer(PublicUserSerializer):
    profile_image = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta(PublicUserSerializer.Meta):
        fields = PublicUserSerializer.Meta.fields + (
            "email",
            "profile_image",
            "bio",
            "is_staff",
            "is_banned",
            "created_at",
        )
        read_only_fields = ("id", "email", "is_staff", "is_banned", "created_at")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    password_confirm = serializers.CharField(write_only=True, trim_whitespace=False)

    class Meta:
        model = User
        fields = ("email", "name", "password", "password_confirm")

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.annotate(normalized=Lower("email")).filter(normalized=normalized).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return normalized

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        candidate = User(email=attrs.get("email"), name=attrs.get("name"))
        password_validation.validate_password(attrs["password"], candidate)
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            email=attrs["email"].strip().lower(),
            password=attrs["password"],
        )
        if user is None:
            raise serializers.ValidationError("Invalid email or password.")
        if user.is_banned:
            raise serializers.ValidationError("This account has been suspended.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        attrs["user"] = user
        return attrs


class AdminUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ("is_active", "last_login")
        read_only_fields = fields


def tokens_for_user(user: User) -> dict[str, str]:
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}
