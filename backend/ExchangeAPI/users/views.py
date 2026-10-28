from django.db.models import Q
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .models import User
from .serializers import (
    AdminUserSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
    tokens_for_user,
)


class RegisterView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "auth"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"user": UserSerializer(user, context={"request": request}).data, **tokens_for_user(user)},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "auth"

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        return Response(
            {"user": UserSerializer(user, context={"request": request}).data, **tokens_for_user(user)}
        )


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        refresh_value = request.data.get("refresh")
        if not refresh_value:
            return Response({"refresh": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
        try:
            RefreshToken(refresh_value).blacklist()
        except TokenError:
            return Response({"refresh": ["Invalid or expired token."]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (IsAdminUser,)
    serializer_class = AdminUserSerializer
    queryset = User.objects.all()
    search_fields = ("name", "email")
    ordering_fields = ("created_at", "name", "email")

    @action(detail=True, methods=("post",))
    def ban(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response({"detail": "You cannot suspend your own account."}, status=400)
        user.is_banned = True
        user.is_active = False
        user.save(update_fields=("is_banned", "is_active", "updated_at"))
        return Response(self.get_serializer(user).data)

    @action(detail=True, methods=("post",))
    def unban(self, request, pk=None):
        user = self.get_object()
        user.is_banned = False
        user.is_active = True
        user.save(update_fields=("is_banned", "is_active", "updated_at"))
        return Response(self.get_serializer(user).data)


class AdminStatsView(APIView):
    permission_classes = (IsAdminUser,)

    def get(self, _request):
        from listings.models import FurnitureItem
        from messaging.models import Message
        from transactions.models import TransactionRequest

        return Response(
            {
                "users": User.objects.count(),
                "active_listings": FurnitureItem.objects.filter(status="available").count(),
                "pending_requests": TransactionRequest.objects.filter(status="pending").count(),
                "messages": Message.objects.count(),
                "suspended_users": User.objects.filter(Q(is_banned=True) | Q(is_active=False)).count(),
            }
        )
